/* eslint-disable react/no-deprecated */
require('font-awesome-webpack');

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from 'redux';
import ConnectedSwmmApp from "./swmm_app.jsx";
import sampleInpText from "../helper/sample_inp.es6";
import GraphHelper from "../helper/graph_helper";
import INPHelper from "../helper/inp_helper";
import CONSTS from "./consts";

const reducer = (state, action) => {
  let newState = Object.assign({}, state);
  switch(action.type) {
    case CONSTS.LOAD_PROJECT:
      newState.project = action.project;
      newState.graphHelper = new GraphHelper(action.project);
      newState.ui.activeFeature = CONSTS.NONE_FEATURE;
      newState.ui.activeId = CONSTS.EMPTY_STRING;
      return newState;
    case CONSTS.SET_ACTIVE_FEATURE:
      newState.ui.activeFeature = action.activeFeature;
      newState.ui.activeId = CONSTS.EMPTY_STRING;
      return newState;
    case CONSTS.SET_ACTIVE_ITEM:
      const isSameId = state.ui.activeId === action.activeId;
      newState.ui.activeId = isSameId ? CONSTS.EMPTY_STRING : action.activeId;
      newState.ui.activeFeature = action.activeFeature;
      newState.ui.isRightPaneEnabled = false;
      return newState;
    case CONSTS.EDIT_ACTIVE_ITEM:
      newState.ui.isRightPaneEnabled = true;
      return newState;
    case CONSTS.TOGGLE_PIN_RIGHT_PANE:
      newState.ui.isRightPanePinned = !newState.ui.isRightPanePinned;
      return newState;
    case CONSTS.CLOSE_RIGHT_PANE:
      newState.ui.isRightPanePinned = false;
      newState.ui.isRightPaneEnabled = false;
      return newState;
    case CONSTS.UPDATE_LIST_FILTER:
      newState.ui.listFilter = action.text;
      return newState;
    default:
      return state;
  }
};

const inpHelper = new INPHelper(sampleInpText);
const project = inpHelper.parse();
const initState = {
  project,
  graphHelper: new GraphHelper(project),
  ui: {
    activeFeature: CONSTS.NONE_FEATURE,
    activeId: CONSTS.EMPTY_STRING,
    isRightPaneEnabled: false,
    isRightPanePinned: false,
    listFilter: CONSTS.EMPTY_STRING,
  }
};

const enhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || (a => a);
const store = createStore(reducer, initState, enhancer(applyMiddleware()));

// 建立錯誤邊界元件，攔截舊版 React #170 崩潰
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SWMM ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h2 style={{ color: '#d9534f' }}>SWMM Online 載入遇到相容性錯誤</h2>
          <p>系統已攔截舊版 React 生命週期衝突。您可以嘗試重新整理頁面。</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', background: '#0275d8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            重新整理頁面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 確保 DOM 載入後才安全渲染
window.addEventListener('DOMContentLoaded', () => {
  let mountNode = document.getElementById('swmm-online');
  if (!mountNode) {
    mountNode = document.createElement('div');
    mountNode.id = 'swmm-online';
    document.body.appendChild(mountNode);
  }

  ReactDOM.render(
    <Provider store={store}>
      <ErrorBoundary>
        <ConnectedSwmmApp/>
      </ErrorBoundary>
    </Provider>,
    mountNode
  );
});
