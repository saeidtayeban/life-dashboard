import htm from '../vendor/htm.module.js';

export const html = htm.bind(React.createElement);
export const {
  useState,
  useEffect,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  createContext,
  Fragment,
} = React;
