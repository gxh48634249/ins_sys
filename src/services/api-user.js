import request from '@/utils/request';
import server from '../../config/service.config';

export async function selectUser(params) {
  const service = server.server;
  const resource = '/user/selectUser';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function modifyUser(params) {
  const service = server.server;
  const resource = '/user/modifyUser';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function lockOpertion(params) {
  const service = server.server;
  const resource = '/user/lockOpertion';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function insertUser(params) {
  const service = server.server;
  const resource = '/user/insertUser';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function initPwd(params) {
  const service = server.server;
  const resource = '/user/initPwd';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function deleteUser(params) {
  const service = server.server;
  const resource = '/user/deleteUser';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function bindRole(params) {
  const service = server.server;
  const resource = '/user/bindRole';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function bindOrgan(params) {
  const service = server.server;
  const resource = '/user/bindOrgan';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function selectUserEasy(params) {
  const service = server.server;
  const resource = '/user/selectUserEasy';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function changeUserStatue(params) {
  const service = server.server;
  const resource = '/user/changeUserStatue';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}
