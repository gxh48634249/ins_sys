import request from '@/utils/request';
import server from '../../config/service.config';

export async function deleteResource(params) {
  const service = server.server;
  const resource = '/resource/deleteResource';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function insertResource(params) {
  const service = server.server;
  const resource = '/resource/insertResource';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function modifyResource(params) {
  const service = server.server;
  const resource = '/resource/modifyResource';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function reloadResourcePer(params) {
  const service = server.server;
  const resource = '/resource/reloadResourcePer';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function removeResourcePer(params) {
  const service = server.server;
  const resource = '/resource/removeResourcePer';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function selectAllSysResource(params) {
  const service = server.server;
  const resource = '/resource/selectAllSysResource';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function selectResource(params) {
  const service = server.server;
  const resource = '/resource/selectResource';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}
