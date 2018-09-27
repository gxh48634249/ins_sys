import { message } from 'antd';

export function result(reponse) {
  const temp = {};
  if(reponse) {
    if(reponse.statue==='1') {
      message.success(reponse.message);
    }else {
      message.error(reponse.message);
    }
    if(reponse.data) {
      temp.data = reponse.data;
    }
    if(reponse.pageInfo) {
      temp.pageInfo = reponse.pageInfo;
    }
  }else {
    message.error("服务器异常!")
    return {};
  }
  return temp;
}

export function page(reponse) {
  const temp = {};
  if(reponse) {
    if(reponse.statue==='1') {
      message.success(reponse.message);
    }else {
      message.error(reponse.message);
    }
    if(reponse.data) {
      temp.data = reponse.data;
    }
    if(reponse.pageInfo) {
      temp.pageInfo = reponse.pageInfo;
    }
  }else {
    message.error("服务器异常!")
    return {};
  }
  return temp;
}
