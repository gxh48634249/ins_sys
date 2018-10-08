import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { selectRole, modifyRole, insertRole, deleteRole, selectPer, roleBindPer, selectPerByRole } from '@/services/api-permission';
import { msToDate } from '@/utils/utils';

export default {
  namespace: 'PermissionEntity',

  state: {
    role:[],
    permission:[],
    rolePer: [],
  },

  effects: {
    *selectRole({ payload }, { call, put }) {
      const response = yield call(selectRole, payload);
      if(response.statue===1) {
        yield put ({
          type: 'roleSelect',
          payload: response.data,
        })
        message.success(response.message)
      }else {
        message.error(response.message);
      }
    },
    *modifyRole({ payload }, { call, put }) {
      const response = yield call(modifyRole, payload);
      if(response.statue===1) {
        yield put ({
          type: 'roleModify',
          payload,
        })
        message.success(response.message)
      }else {
        message.error(response.message);
      }
    },
    *deleteRole({ payload }, { call, put }) {
      const response = yield call(deleteRole, payload);
      if(response.statue===1) {
        yield put ({
          type: 'roleDelete',
          payload,
        })
        message.success(response.message)
      }else {
        message.error(response.message);
      }
    },
    *insertRole({ payload }, { call, put  }) {
      const response = yield call(insertRole, payload);
      if(response.statue===1) {
        yield put ({
          type: 'roleInsert',
          payload: response.data,
        })
        message.success(response.message)
      }else {
        message.error(response.message);
      }
    },
    *roleBindPer({ payload }, { call }) {
      const response = yield call(selectPer, payload);
      if(response.statue===1) {
        message.success(response.message)
      }else {
        message.error(response.message);
      }
    },
    *selectPer({ payload }, { call, put }) {
      const response = yield call(selectPer, payload);
      if(response.statue===1) {
        yield put ({
          type: 'perSelect',
          payload: response.data,
        })
      }else {
        message.error(response.message);
      }
    },
    *selectPerByRole({ payload }, { call, put }) {
      const response = yield call(selectPerByRole, payload);
      if(response.statue===1) {
        yield put ({
          type: 'perSelectByRole',
          payload: response.data,
        })
      }else {
        message.error(response.message);
      }
    },
  },

  reducers: {
    roleSelect(state, { payload }) {
      return {
        ...state,
        role: payload.map(item => {
          return {
            ...item,
            time: msToDate(item.createTime).hasTime,
          }
        }),
      };
    },
    roleDelete(state, { payload }) {
      const index = state.role.findIndex(item => item.roleId===payload.roleId);
      if(index>-1) {
        state.role.splice(index,1)
      }
      return {
        ...state,
      };
    },
    roleInsert(state, { payload }) {
      state.role.push({
        ...payload,
        time: msToDate(payload.createTime).hasTime,
      })
      return {
        ...state,
      };
    },
    perSelect(state, { payload }) {
      return {
        ...state,
        permission: payload,
      };
    },
    perSelectByRole(state, { payload }) {
      return {
        ...state,
        rolePer: payload,
      };
    },
    roleModify(state, { payload }) {
      const entity = payload.roleInfoEntity;
      const index = state.role.findIndex(item => item.roleId===entity.roleId);
      let data = state.role[index];
      data = {...data,roleName:entity.roleName,roleDesc:entity.roleDesc}
      console.log(data,'jieguo ')
      state.role.splice(index,1,data);
      return {
        ...state,
        rolePer: payload,
      };
    },
  },
};
