// import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { selectUser, modifyUser, lockOpertion, insertUser, initPwd, deleteUser, bindRole, bindOrgan, selectUserEasy, changeUserStatue } from '@/services/api-user';
import { msToDate } from '@/utils/utils';
import { getLibraryMap } from '@/services/api-library';

export default {
  namespace: 'UserEntity',

  state: {
    data: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    userStatue: {}
  },

  effects: {
    *initLibraryMap({ payload }, { call, put }) {
      const respons = yield call(getLibraryMap, payload);
      yield put({
        type: 'libraryMap',
        payload: respons.data,
      });
    },
    *selectUserEasy({ payload }, { call, put }) {
      const respons = yield call(selectUserEasy, payload);
      if (respons.statue===1) {
        yield put({
          type: 'select',
          payload: respons,
        });
        message.info(respons.message)
      }else {
        message.info(respons.message)
      }
    },
    *selectUser({ payload }, { call, put }) {
      const respons = yield call(selectUser, payload);
      if (respons.statue===1) {
        yield put({
          type: 'select',
          payload: respons,
        });
        message.info(respons.message)
      }else {
        message.info(respons.message)
      }
    },
    *changeUserStatue({ payload }, { call, put }) {
      const respons = yield call(changeUserStatue, payload);
      if (respons.statue===1) {
        yield put({
          type: 'modify',
          payload,
        });
        message.info(respons.message)
      }else {
        message.info(respons.message)
      }
    },
    *modifyUser({ payload }, { call, put }) {
      const respons = yield call(modifyUser, payload);
      if (respons.statue===1) {
        yield put({
          type: 'modify',
          payload,
        });
        message.info(respons.message)
      }else {
        message.info(respons.message)
      }
    },
    *lockOpertion({ payload }, { call, put }) {
      const respons = yield call(lockOpertion, payload);
      yield put({
        type: 'lock',
        payload: respons.data,
      });
    },
    *insertUser({ payload }, { call, put }) {
      const respons = yield call(insertUser, payload);
      if (respons.statue===1) {
        yield put({
          type: 'insert',
          payload: respons.data,
        });
        message.info(respons.message)
      }else {
        message.info(respons.message)
      }

    },
    *initPwd({ payload }, { call, put }) {
      const respons = yield call(initPwd, payload);
      yield put({
        type: 'initP',
        payload: respons.data,
      });
    },
    *deleteUser({ payload }, { call, put }) {
      const respons = yield call(deleteUser, payload);
      if (respons.statue===1) {
        yield put({
          type: 'delete',
          payload,
        });
        message.info(respons.message)
      }else {
        message.info(respons.message)
      }

    },
    *bindRole({ payload }, { call, put }) {
      const respons = yield call(bindRole, payload);
      yield put({
        type: 'bindR',
        payload: respons.data,
      });
    },
    *bindOrgan({ payload }, { call, put }) {
      const respons = yield call(bindOrgan, payload);
      yield put({
        type: 'bindO',
        payload: respons.data,
      });
    },
  },

  reducers: {
    select(state, { payload }) {
      return{
        ...state,
        pagination: {
          current: payload.pageInfo.pageNum+1,
          pageSize: payload.pageInfo.pageSize,
          total: payload.pageInfo.totalInfo,
        },
        data: payload.data.map(item => {
          return {
            ...item,
            key: item.userId,
            expiredTimeS: msToDate(item.expiredTime).hasTime,
            createTimeS: msToDate(item.createTime).hasTime,
            userStatueS: state.userStatue[item.userStatue],
          }
        }),
      }
    },
    libraryMap(state, { payload }) {
      return{
        ...state,
        userStatue: payload,
      }
    },
    modify(state, { payload }) {
      const newData = state.data;
      const index = newData.findIndex(item => payload.userInfoEntity.userId === item.key);
      const item = newData[index];
      newData.splice(index,1,{
        ...item,
        ...payload.userInfoEntity,
      });
      return{
        ...state,
        data: newData ,
      }
    },
    lock(state, { payload }) {
      return{
        ...state,
        libraryMap: payload,
      }
    },
    insert(state, { payload }) {
      state.data.push({
        ...payload,
        key: payload.userId,
        expiredTimeS: msToDate(payload.expiredTime).hasTime,
        createTimeS: msToDate(payload.createTime).hasTime,
        userStatueS: state.userStatue[payload.userStatue],
      })
      return{
        ...state,
      }
    },
    initP(state, { payload }) {
      return{
        ...state,
        libraryMap: payload,
      }
    },
    delete(state, { payload }) {
      const newData = [];
      const removeId = payload.userInfoEntity.userId.split(',');
      state.data.forEach(userEntity => {
        const index = removeId.findIndex(item => item===userEntity.userId);
        if(index<0) {
          newData.push(userEntity);
        }
      })
      return{
        ...state,
        data: newData,
      }
    },
    bindR(state, { payload }) {
      return{
        ...state,
        libraryMap: payload,
      }
    },
    bindO(state, { payload }) {
      return{
        ...state,
        libraryMap: payload,
      }
    },
  },
};
