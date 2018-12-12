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
      const response = yield call(deleteLibrary, {libraryCode: payload});
      if(response.statue===1) {
        message.success(response.message)
        yield put({
          type: 'handleDelete',
          payload,
        });
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
      const response = yield call(modifyLibrary, payload);
      if(response.statue===1) {
        yield put({
          type: 'handleEdit',
          payload,
        });
      }else {
        message.error(response.message)
      }
    },
    *add({ payload },{ call, put }) {
      const response = yield call(insertLibrary, payload);
      if(response.statue===1) {
        message.success(response.message)
        yield put({
          type: 'handleAdd',
          payload: {
            data: response.data,
          },
        });
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
      if(payload.child) {
        payload.child.map(item => {
          const entity = { title: item.libraryName, key: item.libraryCode ,parentCode: item.parentCode};
          state.treeData.push(entity);
        });
      }
      return{
        ...state,
      }
    },
    initTreeData (state, { payload }) {
      const treeData = [];
      if(payload.data) {
        payload.data.map(item => {
          const entity = { title: item.libraryName, key: item.libraryCode, parentCode: item.parentCode };
          treeData.push(entity)
        })
      }
      return{
        ...state,
        treeData:treeData,
      }
    },
    handleEdit (state, { payload }) {
      const entity = { title: payload.libraryName, key: payload.libraryCode ,parentCode: payload.parentCode};
      const index = state.treeData.findIndex(item => item.key===payload.libraryCode)
      if (index>-1) {
        state.treeData.splice(index,1,entity)
      }
      return{
        ...state,
      }
    },
    handleAdd (state, { payload }) {
      console.log(payload, '====新增数据')
      const entity = { title: payload.data.libraryName, key: payload.data.libraryCode, parentCode: payload.data.parentCode };
      state.treeData.push(entity);
      console.log(state.treeData, '=====treedata')
      // if (payload.data.parentCode !== '0') {
      //   state.treeNode.props.dataRef.children.push(entity);
      // }else {
      //   state.treeData.push(entity);
      // }
      return{
        ...state
      }
    },
    onExpand (state, { payload }) {
      return {
        ...state,
        expandedKeys: payload.expandedKeys,
        autoExpandParent: true,
      }
    },
    handleDelete (state, { payload }) {
      const temp = state.treeData.filter(item => {
        return item.key !== payload
      });
      console.log(temp, '======temp')
      return {
        ...state,
        treeData: temp,
      }
    }
  },
};
