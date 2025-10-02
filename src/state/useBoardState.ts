import { create } from "zustand";

interface BoardState {
  selectedNodeId: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;
}

export const useBoardState = create<BoardState>((set) => ({
  selectedNodeId: null,
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
}));
