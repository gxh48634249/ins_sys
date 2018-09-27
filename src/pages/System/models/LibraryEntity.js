import { message } from 'antd';
import { insertLibrary, deleteLibrary, findByParentCode, modifyLibrary } from '@/services/api-library';
import React from 'react';

export default {
  namespace: 'LibraryEntity',

  state: {
    treeData: [],
    treeNode:{},
    selectKey: '',
    expandedKeys: [],
    autoExpandParent: true,
  },

  effects: {
    *delete({ payload }, { call, put }) {
      const respons = yield call(deleteLibrary, {libraryCode: payload});
      if(response.statue===1) {
        message.success(response.message)
      }else {
        message.error(response.message)
      }
    },
    *onload({ payload }, { call, put }) {
      const respons = yield call(findByParentCode, {parentCode: payload.parentCode});
      yield put({
        type: 'addChild',
        payload:{
          child: respons.data,
          treeNode: payload.treeNode
        },
      });
    },
    *init({ payload },{ call, put }) {
      const respons = yield call(findByParentCode, {parentCode: '0'});
      if (respons&&respons.data) {
        yield put({
          type: 'initTreeData',
          payload: {
            data:respons.data
          },
        });
      }else {
        yield put({
          type: 'initTreeData',
          payload: {
            data:[],
          },
        });
      }
    },
    *edit({ payload },{ call, put }) {
      const respons = yield call(modifyLibrary, payload);
      yield put({
        type: 'handleEdit',
        payload: {
          data: payload.libraryName,
        },
      });
    },
    *add({ payload },{ call, put }) {
      const response = yield call(insertLibrary, payload);
      yield put({
        type: 'handleAdd',
        payload: {
          data: response.data,
        },
      });
      if(response.statue===1) {
        message.success(response.message)
      }else {
        message.error(response.message)
      }
    },
    *select({ payload },{ put }) {
      console.log(payload,'B')
      yield put({
        type: 'handleSelect',
        payload,
      });
    },
    *expand({ payload },{ put }) {
      yield put({
        type: 'onExpand',
        payload,
      });
    },
  },

  reducers: {
    delete (state, { payload }) {
      return {
        ...state
      }
    },
    addChild (state, { payload }) {
      const child = [];
      if(payload.child) {
        payload.child.map(item => {
          const entity = { title: item.libraryName, key: item.libraryCode };
          child.push(entity);
        });
      }
      payload.treeNode.props.dataRef.children = child;
      return{
        ...state,
      }
    },
    initTreeData (state, { payload }) {
      const treeData = [];
      if(payload.data) {
        payload.data.map(item => {
          const entity = { title: item.libraryName, key: item.libraryCode };
          treeData.push(entity)
        })
      }
      return{
        ...state,
        treeData:treeData,
      }
    },
    handleEdit (state, { payload }) {
      state.treeNode.props.dataRef.title = payload.data;
      return{
        ...state,
      }
    },
    handleAdd (state, { payload }) {
      const entity = { title: payload.data.libraryName, key: payload.data.libraryCode };
      if (state.treeNode&&state.treeNode.props) {
        state.treeNode.props.dataRef.children.push(entity);
      }else {
        state.treeData.push(entity);
      }
      return{
        ...state
      }
    },
    handleSelect (state, { payload }) {
      console.log(payload,'C')
      if(payload.info.selected) {
        return {
          ...state,
          treeNode: payload.info.node,
          selectKey: payload.selectedKeys[0],
        }
      }
      return {
        ...state,
        treeNode: {},
        selectKey: '',
      }
    },
    onExpand (state, { payload }) {
      return {
        ...state,
        expandedKeys: payload.expandedKeys,
        autoExpandParent: true,
      }
    }
  },
};
