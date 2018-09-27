import request from '@/utils/request';
import server from '../../config/service.config';

export async function deleteOrgan(params) {
  const service = server.server;
  const resource = '/organ/deleteOrgan';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function insertOrgan(params) {
  const service = server.server;
  const resource = '/organ/insertOrgan';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function modifyOrgan(params) {
  const service = server.server;
  const resource = '/organ/modifyOrgan';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function selectAllOrgan(params) {
  const service = server.server;
  const resource = '/organ/selectAllOrgan';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function selectUser(params) {
  const service = server.server;
  const resource = '/organ/selectUser';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}
