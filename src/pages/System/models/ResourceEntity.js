import { deleteResource, insertResource, modifyResource, reloadResourcePer, removeResourcePer, selectAllSysResource, selectResource } from '@/services/api-resource';
import { getLibraryMap } from '@/services/api-library';
import { selectPer } from '@/services/api-permission';
import { message } from 'antd'
import React from 'react';

export default {
  namespace: 'ResourceEntity',

  state: {
    resourceData:[],
    permissionData: [],
    libraryMap: {}
  },

  effects: {
    *selectResource({ payload }, { call, put }) {
      const respons = yield call(selectResource, payload);
      yield put({
        type: 'initResource',
        payload: respons.data,
      });
    },
    *initLibraryMap({ payload }, { call, put }) {
      const respons = yield call(getLibraryMap, payload);
      yield put({
        type: 'libraryMap',
        payload: respons.data,
      });
    },
    *selectPer({ payload }, { call, put }) {
      const respons = yield call(selectPer, payload);
      const code = payload.resourceId;
      yield put({
        type: 'initPer',
        payload: {
          data: respons.data,
          code: code,
        },
      });
    },
    *insertResource({ payload }, { call, put }) {
      const respons = yield call(insertResource, payload);
      yield put({
        type: 'saveResource',
        payload: respons.data,
      });
      if (respons.statue===1) {
        message.success(respons.message);
      }else {
        message.warning(respons.message);
      }
    },
    *modifyResource({ payload }, { call, put }) {
      const respons = yield call(modifyResource, payload);
      yield put({
        type: 'modify',
        payload,
      });
      if (respons.statue===1) {
        message.success(respons.message);
      }else {
        message.warning(respons.message);
      }
    },
    *deleteResource({ payload }, { call, put }) {
      const respons = yield call(deleteResource, payload);
      yield put({
        type: 'removeResource',
        payload: payload.resourceCode,
      });
      if (respons.statue===1) {
        message.success("删除成功");
      }else {
        message.warning("删除失败");
      }
    },
    *initStatue({ payload }, { put }) {
      yield put({
        type: 'statue',
        payload,
      });
    },
  },

  reducers: {
    libraryMap(state, { payload }) {
      return{
        ...state,
        libraryMap: payload,
      }
    },
    statue(state, { payload }) {
      return {
        ...state,
        statue: payload,
      }
    },
    initResource(state, { payload }) {
      const generate = [];
      let child = [];
      payload.forEach((item,index) => {
        if(item.resourceParentCode==='0') {
          generate.push({
            ...item,
            children: [],
            resourceType: state.libraryMap[item.resourceType]?state.libraryMap[item.resourceType]:item.resourceType,
            key: item.resourceId,
          });
        }else {
          child.push(item)
        }
      });
      const addChild = (last,parent) => {
        let childrens = [];
        last.forEach((item) => {
          if(item.resourceParentCode===parent.resourceCode) {
            parent.children.push({
              ...item,
              children: [],
              resourceType: state.libraryMap[item.resourceType]?state.libraryMap[item.resourceType]:item.resourceType,
              key: item.resourceId,
            });
          }else {
            childrens.push(item);
          }
        })
        if(parent.children.length>0&&childrens.length>0) {
          parent.children.map(item => {
            addChild(childrens,item);
          })
        }
      }
      generate.forEach(item => {
        if(child.length>0) {
          addChild(child,item);
        }
      })
      return {
        ...state,
        resourceData: generate,
      };
    },
    initPer(state, { payload }) {
      const code = payload.code;
      if(payload.data) {
        return {
          ...state,
          [code]: payload.data.map(item => {
            return{
              ...item,
              key: item.permissionId,
            }
          }),
          statue: true,
        }
      }
      return {
        ...state,
        [code]: [],
        statue: true,
      };
    },
    saveResource(state, { payload }) {
      if(payload.resourceParentCode==='0') {
        state.resourceData.push({
          ...payload,
          children: [],
          resourceType: state.libraryMap[payload.resourceType]?state.libraryMap[payload.resourceType]:payload.resourceType,
          key: item.resourceId,
        });
      }else {
        const addChild = (list, child) => {
          list.forEach(item => {
            if (item.resourceCode===child.resourceParentCode) {
              item.children.push({
                ...child,
                children: [],
                resourceType: state.libraryMap[child.resourceType]?state.libraryMap[child.resourceType]:child.resourceType,
                key: item.resourceId,
              });
            }else {
              if(item.children.length>0) {
                addChild(item.children, child);
              }
            }
          })
        }
        addChild(state.resourceData,payload);
      }
      return {
        ...state,
      };
    },
    modify(state, { payload }) {
      const newData = [...state.resourceData];
      if(payload.resourceParentCode==='0') {
        const index = state.resourceData.findIndex(item => item.resourceCode===payload.resourceCode);
        newData.splice(index,1,payload);
        return {
          ...state,
          resourceData: [...newData],
        };
      }else {
        const findChild = (list) => {
          for (let i=0;i<list.length;i++) {
            if (list[i].resourceCode===payload.resourceCode) {
              list.splice(i,1,{...payload});
              break;
            }else {
              if(list[i].children&&list[i].children.length>0) {
                findChild(list[i].children);
              }
            }
          }
        }
        findChild(newData);
        return {
          ...state,
          resourceData: [...newData],
        };
      }
    },
    removeResource(state, { payload }) {
      const remove = (list) => {
        list.forEach((item, index) => {
          if(item.resourceCode===payload) {
            list.splice(index,1);
          }else {
            if(item.children&&item.children.length>0) {
              remove(item.children);
            }
          }
        })
      }
      remove(state.resourceData);
      return {
        ...state,
      };
    },
    saveStepFormData(state, { payload }) {
      return {
        ...state,
        step: {
          ...state.step,
          ...payload,
        },
      };
    },
  },
};
