import request from '@/utils/request';
import server from '../../config/service.config';

export async function insertLibrary(params) {
  const service = server.server;
  const resource = '/library/insertLibrary';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function findAll(params) {
  const service = server.server;
  const resource = '/library/findAll';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function deleteLibrary(params) {
  const service = server.server;
  const resource = '/library/deleteLibrary';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function findByParentCode(params) {
  const service = server.server;
  const resource = '/library/findByParentCode';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function modifyLibrary(params) {
  const service = server.server;
  const resource = '/library/modifyLibrary';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function getLibraryMap(params) {
  const service = server.server;
  const resource = '/library/getLibraryMap';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}
