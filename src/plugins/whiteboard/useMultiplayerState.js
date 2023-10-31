// @ts-check
import { useCallback, useEffect, useRef, useState } from "react";
import { Utils } from "@tldraw/core";
import { selectDidIJoinWithin, useHMSStore } from "@100mslive/react-sdk";
import { provider as room } from "./PusherCommunicationProvider";
import { WhiteboardEvents as Events } from "./WhiteboardEvents";
import { useWhiteboardMetadata } from "./useWhiteboardMetadata";

const useWhiteboardState = () => {
  const { amIWhiteboardOwner } = useWhiteboardMetadata();
  /*
   * LIVE-1470 state need to have some delay after join.
   * It will initialize pusher room and send request state.
   */
  const shouldRequestState = useHMSStore(selectDidIJoinWithin(2000));

  return { shouldRequestState, amIWhiteboardOwner };
};

function keepSelectedShapesInViewport(app) {
  const { selectedIds } = app;
  if (selectedIds.length <= 0) return;

  // Get the selected shapes
  const shapes = selectedIds.map(id => app.getShape(id));

  // Get the bounds of the selected shapes
  const bounds = Utils.getCommonBounds(
    shapes.map(shape => app.getShapeUtil(shape).getBounds(shape))
  );

  // Define the min/max x/y (here we're using the viewport but
  // we could use any arbitrary bounds)
  const { minX, minY, maxX, maxY } = app.viewport;

  // Check for any overlaps between the viewport and the selection bounding box
  let ox = Math.min(bounds.minX, minX) || Math.max(bounds.maxX - maxX, 0);
  let oy = Math.min(bounds.minY, minY) || Math.max(bounds.maxY - maxY, 0);

  // If there's any overlaps, then update the shapes so that
  // there is no longer any overlap.
  if (ox !== 0 || oy !== 0) {
    app.updateShapes(
      ...shapes.map(shape => ({
        id: shape.id,
        point: [shape.point[0] - ox, shape.point[1] - oy],
      }))
    );
  }
}

/**
 * Ref: https://github.com/tldraw/tldraw/blob/main/apps/www/hooks/useMultiplayerState.ts
 */
export function useMultiplayerState(roomId) {
  const [app, setApp] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const { amIWhiteboardOwner, shouldRequestState } = useWhiteboardState();

  /**
   * Stores current state(shapes, bindings, [assets]) of the whiteboard
   */
  const rLiveShapes = useRef(new Map());
  const rLiveBindings = useRef(new Map());

  const getCurrentState = useCallback(() => {
    return {
      shapes: rLiveShapes.current
        ? Object.fromEntries(rLiveShapes.current)
        : {},
      bindings: rLiveBindings.current
        ? Object.fromEntries(rLiveBindings.current)
        : {},
    };
  }, []);

  const sendDataInStream = useCallback(() => {
    const shapesIterator = rLiveShapes.current?.entries();
    const bindingsIterator = rLiveBindings.current?.entries();
    let initial = true;
    // it will run until shapes and binding data is broadcast
    for (;;) {
      const shapes = shapesIterator.next();
      let shape = {};
      if (!shapes.done) shape[shapes.value[0]] = shapes.value[1];
      const bindings = bindingsIterator.next();
      let binding = {};
      if (!bindings.done) binding[bindings.value[0]] = bindings.value[1];
      if (shapes.done && bindings.done) break;
      if (initial) {
        room.broadcastEvent(Events.CURRENT_STATE, {
          shapes: shape,
          bindings: binding,
        });
        initial = false;
        continue;
      }
      room.broadcastEvent(Events.STATE_CHANGE, {
        shapes: shape,
        bindings: binding,
      });
    }
  }, []);

  const sendCurrentState = useCallback(() => {
    // TODO - add data chunking
    if (amIWhiteboardOwner && isReady) {
      sendDataInStream();
    }
  }, [amIWhiteboardOwner, isReady, sendDataInStream]);

  const updateLocalState = useCallback(({ shapes, bindings, merge = true }) => {
    if (!(shapes && bindings)) {
      return;
    }

    if (merge) {
      const lShapes = rLiveShapes.current;
      const lBindings = rLiveBindings.current;

      if (!(lShapes && lBindings)) return;
      Object.entries(shapes).forEach(([id, shape]) => {
        if (!shape) {
          lShapes.delete(id);
        } else {
          lShapes.set(shape.id, shape);
        }
      });

      Object.entries(bindings).forEach(([id, binding]) => {
        if (!binding) {
          lBindings.delete(id);
        } else {
          lBindings.set(binding.id, binding);
        }
      });
    } else {
      rLiveShapes.current = new Map(Object.entries(shapes));
      rLiveBindings.current = new Map(Object.entries(bindings));
    }
  }, []);

  const applyStateToBoard = useCallback(
    state => {
      app === null || app === void 0
        ? void 0
        : app.replacePageContent(
            state.shapes,
            state.bindings,
            {} // Object.fromEntries(lAssets.entries())
          );
    },
    [app]
  );

  const handleChanges = useCallback(
    state => {
      if (!state) {
        return;
      }
      const { shapes, bindings } = state;
      updateLocalState({
        shapes,
        bindings,
        merge: true,
      });
      applyStateToBoard(getCurrentState());
    },
    [applyStateToBoard, getCurrentState, updateLocalState]
  );

  const setupInitialState = useCallback(() => {
    if (!isReady) {
      return;
    }

    if (amIWhiteboardOwner) {
      // On board open, update the document with initial/stored content
      handleChanges(room.getStoredEvent(Events.CURRENT_STATE));
      // Send current state to other peers in the room currently
      sendCurrentState();
    } else if (shouldRequestState) {
      /**
       * Newly joined peers request the owner for current state
       * and update their boards when they receive it
       */
      room.broadcastEvent(Events.REQUEST_STATE);
    }
  }, [
    isReady,
    amIWhiteboardOwner,
    shouldRequestState,
    handleChanges,
    sendCurrentState,
  ]);

  const zoomToContent = useCallback(() => {
    app.zoomToContent();
  }, [app]);

  // Callbacks --------------
  // Put the state into the window, for debugging.
  const onMount = useCallback(
    app => {
      app.loadRoom(roomId);
      app.pause(); // Turn off the app's own undo / redo stack
      window.app = app;
      setApp(app);
    },
    [roomId]
  );

  // Update the live shapes when the app's shapes change.
  const onChangePage = useCallback(
    (_app, shapes, bindings, _assets) => {
      updateLocalState({ shapes, bindings });
      //keepSelectedShapesInViewport(app);
      room.broadcastEvent(Events.STATE_CHANGE, { shapes, bindings });

      /**
       * Tldraw thinks that the next update passed to replacePageContent after onChangePage is the own update triggered by onChangePage
       * and the replacePageContent doesn't have any effect if it is a valid update from remote.
       *
       * To overcome this replacePageContent locally onChangePage(not costly - returns from first line).
       *
       * Refer: https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/state/TldrawApp.ts#L684
       */
      applyStateToBoard(getCurrentState());
    },
    [updateLocalState, applyStateToBoard, getCurrentState]
  );

  const onChange = useCallback(() => {
    if (!app) return;

    if (app.camera.point[0] !== 0 || app.camera.point[1] !== 0) {
      app.setCamera([0, 0], app.camera.zoom, "force camera");
    }

    keepSelectedShapesInViewport(app);
  }, [app]);

  // Subscriptions and initial setup
  useEffect(() => {
    if (!app) return;
    const unsubs = [];

    let stillAlive = true;

    // Setup the document's storage and subscriptions
    function setupDocument() {
      // Subscribe to changes
      if (stillAlive) {
        unsubs.push(room.subscribe(Events.STATE_CHANGE, handleChanges));
        unsubs.push(room.subscribe(Events.CURRENT_STATE, handleChanges));
        unsubs.push(room.subscribe(Events.CURRENT_STATE, zoomToContent));

        // On request state(peer join), send whole current state to update the new peer's whiteboard
        unsubs.push(room.subscribe(Events.REQUEST_STATE, sendCurrentState));

        setIsReady(true);
      }
    }

    room.init(roomId);
    setupDocument();
    setupInitialState();

    return () => {
      stillAlive = false;
      unsubs.forEach(unsub => unsub());
    };
  }, [
    app,
    roomId,
    setupInitialState,
    sendCurrentState,
    handleChanges,
    zoomToContent,
  ]);

  useEffect(() => {
    // Store last state on closing whitboard so that when the board is reopened the state could be fetched and reapplied
    const handleUnmount = () => {
      if (isReady && !shouldRequestState) {
        console.log("Whiteboard unmount storing", getCurrentState());
        room.storeEvent(Events.CURRENT_STATE, getCurrentState());
      }
    };

    return handleUnmount;
  }, [isReady, shouldRequestState, getCurrentState]);

  return { onMount, onChangePage, onChange };
}
