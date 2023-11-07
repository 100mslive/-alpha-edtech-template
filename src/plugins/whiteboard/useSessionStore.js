// @ts-check
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Utils } from "@tldraw/core";
import debounce from "lodash.debounce";
import {
  selectSessionStore,
  useHMSActions,
  useHMSStore,
} from "@100mslive/react-sdk";
import { useIsHeadless } from "../../components/AppData/useUISettings";
import { useWhiteboardMetadata } from "./useWhiteboardMetadata";

const useWhiteboardState = () => {
  const { amIWhiteboardOwner } = useWhiteboardMetadata();
  const sessionStore = useHMSStore(selectSessionStore());
  const shapes = useMemo(() => {
    if (!sessionStore) return;
    return Object.keys(sessionStore).reduce((prev, key) => {
      if (key.startsWith("whiteboard") && !key.endsWith("*")) {
        prev[key] = sessionStore[key];
      }
      return prev;
    }, {});
  }, [sessionStore]);

  return { amIWhiteboardOwner, shapes };
};

const isEmptyObject = obj => {
  return Object.keys(obj).length === 0;
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
export function useSessionStore() {
  const [app, setApp] = useState(null);
  const hmsActions = useHMSActions();
  const { amIWhiteboardOwner, shapes } = useWhiteboardState();
  const isHeadless = useIsHeadless();
  /**
   * Stores current state(shapes, bindings, [assets]) of the whiteboard
   */
  const rLiveShapes = useRef(new Map());
  const rLiveBindings = useRef(new Map());

  const zoomToFit = useCallback(() => {
    if (!app) return;

    app.zoomToFit();
  }, [app]);

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
      console.log(shapes);
      updateLocalState({
        shapes,
        bindings,
        merge: true,
      });
      applyStateToBoard(getCurrentState());

      if (!amIWhiteboardOwner && isHeadless) {
        zoomToFit();
      }
    },
    [
      applyStateToBoard,
      getCurrentState,
      updateLocalState,
      amIWhiteboardOwner,
      isHeadless,
      zoomToFit,
    ]
  );

  // Callbacks --------------
  // Put the state into the window, for debugging.
  const onMount = useCallback(app => {
    app.pause(); // Turn off the app's own undo / redo stack
    window.app = app;
    setApp(app);
  }, []);

  // Update the live shapes when the app's shapes change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangePage = useCallback(
    debounce((_app, shapes, bindings, _assets) => {
      if (isEmptyObject(shapes) && isEmptyObject(bindings)) return;

      Object.values(shapes).forEach(shape => {
        hmsActions.sessionStore.set(`whiteboard.${shape.id}`, shape);
      });

      updateLocalState({ shapes, bindings });

      /**
       * Tldraw thinks that the next update passed to replacePageContent after onChangePage is the own update triggered by onChangePage
       * and the replacePageContent doesn't have any effect if it is a valid update from remote.
       *
       * To overcome this replacePageContent locally onChangePage(not costly - returns from first line).
       *
       * Refer: https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/state/TldrawApp.ts#L684
       */
      applyStateToBoard(getCurrentState());
    }, 300),
    [
      updateLocalState,
      applyStateToBoard,
      getCurrentState,
      hmsActions.sessionStore,
    ]
  );

  const onChange = useCallback(
    (_app, reason) => {
      if (!app || isHeadless) return;

      if (app.camera.point[0] !== 0 || app.camera.point[1] !== 0) {
        app.setCamera([0, 0], 1, "force camera");
      }

      keepSelectedShapesInViewport(app);
    },
    [app, isHeadless]
  );

  useEffect(() => {
    handleChanges({ shapes });
  }, [shapes, handleChanges]);

  // Subscriptions and initial setup
  useEffect(() => {
    if (!app) return;

    let stillAlive = true;

    function setupDocument() {
      if (stillAlive) {
        hmsActions.sessionStore.observe("whiteboard.*");
      }
    }

    setupDocument();

    return () => {
      stillAlive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app, hmsActions.sessionStore]);

  return { onMount, onChangePage, onChange };
}
