import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { deleteOrgan, insertOrgan, modifyOrgan, selectAllOrgan, selectUser } from '@/services/api-organ';

export default {
  namespace: 'OrganEntity',

  state: {
    treeData: [],
    dataSource: [],
    pagination: {},
  },

  effects: {
    *deleteOrgan({ payload }, { call, put }) {
      console.log(payload,'开始删除')
      const response = yield call(deleteOrgan, payload);
      yield put({
        type: 'remove',
        payload,
      });
      if(response.statue===1) {
        message.success(response.message)
      }else {
        message.error(response.message)
      }
    },
    *insertOrgan({ payload }, { call, put }) {
      const response = yield call(insertOrgan, payload);
      yield put({
        type: 'add',
        payload: response.data,
      });
      if(response.statue===1) {
        message.success(response.message)
      }else {
        message.error(response.message)
      }
    },
    *modifyOrgan({ payload }, { call, put }) {
      const response = yield call(modifyOrgan, payload);
      yield put({
        type: 'modify',
        payload,
      });
      if(response.statue===1) {
        message.success(response.message)
      }else {
        message.error(response.message)
      }
    },
    *selectAllOrgan({ payload }, { call, put }) {
      const respons = yield call(selectAllOrgan, payload);
      yield put({
        type: 'init',
        payload:[...respons.data],
      });
      // if(response.statue===1) {
      //   message.success(response.message)
      // }else {
      //   message.error(response.message)
      // }
    },
    *selectUser({ payload }, { call, put }) {
      const respons = yield call(selectUser, payload);
      yield put({
        type: 'getUser',
        payload:respons,
      });
      if(respons.statue===1) {
        message.success(respons.message)
      }else {
        message.error(respons.message)
      }
    },
  },

  reducers: {
    remove (state, { payload }) {
      console.log(state,'start')
      const index = state.treeData.findIndex(item => item.key===payload.organCode);
      if (index>-1) {
        state.treeData.splice(index,1)
        return {
          ...state,
        }
      }else {
        const newData = [...state.treeData];
        for(let i = 0;i<newData.length;i++) {
          if (newData[i].children&&newData[i].children.length>0) {
            const indexT = newData[i].children.findIndex(item => item.key===payload.organCode)
            const lenth = newData[i].children.length;
            if(indexT>-1) {
              if(lenth>1) {
                newData[i].children.splice(indexT,1)
              }else {
                newData[i].children=[];
              }
              return{
                ...state,
                treeData: [...newData]
              }
            }
          }
        }
      }
    },
    add (state, { payload }) {
      const addChild = (list) => {
        if(payload.parentCode==='0') {
          list.push({
            dataRef: {...payload},
            children: [],
            key: payload.organCode,
            title: payload.organName,
            // isLeaf: false,
            parentKey: payload.parentCode,
          })
        }else {
          list.forEach(item => {
            if(item.key===payload.parentCode) {
              item.children.push({
                dataRef: {...payload},
                children: [],
                key: payload.organCode,
                title: payload.organName,
                // isLeaf: false,
                parentKey: payload.parentCode,
              })
              return;
            }else {
              if(item.children&&item.children.length>0) {
                addChild(item.children);
              }
            }
          })
        }
      }
      addChild(state.treeData);
      return{
        ...state,
      }
    },
    modify (state, { payload }) {
      const modify = (list) => {
        list.forEach((item, index) => {
          if(item.key===payload.organCode) {
            list.splice(index,1,{
              dataRef: {...payload},
              children: [],
              key: payload.organCode,
              title: payload.organName,
              // isLeaf: false,
              parentKey: payload.parentCode,});
            return;
          }else {
            if(list.children&&list.children.length>0) {
              modify(list.children);
            }
          }
        })
      }
      modify(state.treeData);
      return{
        ...state,
      }
    },
    init (state, { payload }) {
      const generat = [];
      payload.forEach((item, index) => {
        if(item.parentCode==='0') {
          generat.push({
            dataRef: {...item},
            children: [],
            key: item.organCode,
            title: item.organName,
            // isLeaf: false,
            parentKey: item.parentCode,
          });
        }
      })
      const addChild = (parent,childs) => {
        const children = [];
        childs.forEach((item, index) => {
          if(parent.key===item.parentCode) {
            parent.children.push({
              children: [],
              key: item.organCode,
              title: item.organName,
              // isLeaf: false,
              dataRef: {...item},
              parentKey: item.parentCode,
            });
          }else {
            children.push(item);
          }
        })
        if(parent.children&&parent.children.length>0&&children.length>0) {
          parent.children.forEach(item => {
            addChild(item,children);
          })
        }
      }
      generat.forEach(item => {
        addChild(item,payload);
      })
      return{
        ...state,
        treeData: [...generat],
      }
    },
    getUser (state, { payload }) {
      console.log(payload.pageInfo,'分页信息')
      return{
        ...state,
        dataSource: payload.data.map(item => {
          return {
            ...item,
            key: item.organId,
          }
        }),
        pagination: {
          current: payload.pageInfo.pageNum+1,
          pageSize: payload.pageInfo.pageSize,
          total: payload.pageInfo.totalInfo,
        },
      }
    },
  },
};
