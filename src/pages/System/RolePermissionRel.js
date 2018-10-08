import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Button,
  Icon,
  List,
  Input,
  Divider,
  Row,
  Col,
  Form,
  Modal,
  TreeSelect,
  Radio,
  DatePicker,
  Select,
} from 'antd';

import Ellipsis from '@/components/Ellipsis';

import styles from './style.less';
import zhCN from 'antd/lib/locale-provider/zh_CN';

const FormItem = Form.Item;

/***
 * 角色管理页面-开始
 */
@connect(({ PermissionEntity, loading }) => ({
  PermissionEntity,
  loading: loading.models.list,
}))
@Form.create()
class RolePermissionRel extends PureComponent {

  state = {
    visible: false,
    statue: 'insert',
    roleId: '',
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'PermissionEntity/selectPer',
      payload: {permissionInfoEntity:{},pageInfo:{}},
    });
    dispatch({
      type: 'PermissionEntity/selectRole',
      payload: {roleInfoEntity:{},pageInfo:{}},
    });
  }


  /* 删除角色 */
  handleDelete = (e) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PermissionEntity/deleteRole',
      payload: {roleId:e.target.className},
    });
  }

  /* 新增角色 */
  handleInsert = (e) => {
    const pid = [];
    if(e.permissionId&&e.permissionId.length>0) {
      e.permissionId.forEach(item => {
        pid.push(item.split(',')[1]);
      })
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'PermissionEntity/insertRole',
      payload: {roleInfoEntity:{...e},permissionId:pid.join(',')},
    });
  }

  /* 激活修改 */
  handleModify = (e) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PermissionEntity/selectPerByRole',
      payload: {roleId:e.target.className},
    });
    const index = this.props.PermissionEntity.role.findIndex(item => item.roleId===e.target.className)
    const form = this.formRef.props.form;
    form.setFieldsValue({...this.props.PermissionEntity.role[index]})
    this.setState({ visible: true, statue: 'modify',roleId:e.target.className});
    console.log(this.props.PermissionEntity.rolePer,'查询结果')
  }

  // /* 激活修改 */
  // handleSave = (e) => {
  //   console.log(e,'激活')
  //   this.setState({ visible: true, statue: 'modify',roleId: e.target.className, });
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'PermissionEntity/selectPerByRole',
  //     payload: {roleId:e.target.className},
  //   });
  //   const index = this.props.PermissionEntity.role.findIndex(item => item.roleId===e.target.className)
  //   const form = this.formRef.props.form;
  //   form.setFieldsValue({...this.props.PermissionEntity.role[index]})
  // }

  /* 保存修改 */
  saveModify = (e) => {
    const pid = [];
    if(e.permissionId&&e.permissionId.length>0) {
      e.permissionId.forEach(item => {
        pid.push(item.split(',')[1]);
      })
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'PermissionEntity/modifyRole',
      payload: {roleInfoEntity:{...e,roleId:this.state.roleId},permissionId:pid.join(',')},
    });
    this.setState({ visible: false, statue: 'info',roleId: '', });
  }

  /* 弹出层展示 */
  showModal = () => {
    const form = this.formRef.props.form;
    form.resetFields();
    this.setState({ visible: true,statue: 'info', });
  }

  /* 弹出层隐藏 */
  handleCancel = () => {
    const form = this.formRef.props.form;
    form.resetFields();
    this.setState({ visible: false });
  }

  /* 弹出层表单关联 */
  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  /* 新增表单信息 */
  handleCreate = () => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log(values);
      if (this.state.statue==='info') {
        this.handleInsert(values)
      }else {
        this.saveModify(values)
      }
      form.resetFields();
      this.setState({ visible: false });
    });
  }

  render() {
    return (
      <div className={styles.cardList}>
        <Button
          type="dashed"
          style={{ width: '100%', marginBottom: 8 }}
          icon="plus"
          onClick={this.showModal}
        >
          添加
        </Button>
        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          treeData={this.props.PermissionEntity.permission}
          modifyData={this.props.PermissionEntity.rolePer}
          statue={this.state.statue}
        />
        <List
          rowKey="id"
          loading={this.props.PermissionEntity.loading}
          grid={{ gutter: 16, lg: 4, md: 3, sm: 1, xs: 1 }}
          dataSource={[...this.props.PermissionEntity.role]}
          renderItem={item =>
            item ? (
              <List.Item key={item.roleId}>
                <Card hoverable className={styles.card} actions={[<a className={item.roleId} onClick={this.handleDelete}>删除</a>, <a className={item.roleId} onClick={this.handleModify}>编辑</a>]}>
                  <Card.Meta
                    title={<a>{item.roleName}/{item.roleCode}</a>}
                    description={
                      <div>
                        <Ellipsis className={styles.item} lines={2}>
                          {item.roleDesc}
                        </Ellipsis>
                        <a className={styles.text}>创建于{item.time}</a>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            ) : (
              <List.Item key='insert'>
                <Button type="dashed" className={styles.newButton}>
                  <Icon type="plus" /> 新增角色
                </Button>
              </List.Item>
            )
          }
        />
      </div>
    );
  }
}
/***
 * 角色管理页面-结束
 */


export default RolePermissionRel;

/***
 * 弹出层展示（用于新增角色信息）
 */
const CollectionCreateForm = Form.create()(
  class extends React.Component {

    render() {
      const formItemLayout = {
        labelCol: {
          xs: { span: 12 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
      };
      const { visible, onCancel, onCreate, form, treeData, modifyData, statue } = this.props;
      const { getFieldDecorator } = form;
      const loop = (data) => {
        const child = [];
        if (data) {
          data.forEach(item => {
            child.push(<Select.Option key={item.permissionName+','+item.permissionId}>{item.permissionName}</Select.Option>);
          })
        }
        return child;
      }
      const data = (data) => {
        const result = [];
        if(data&&data.length>0) {
          data.forEach(item => {
            result.push(item.permissionName+','+item.permissionId)
          })
        }
        return result;
      }
      return (
        <Modal
          visible={visible}
          title={statue==='info'?'新增角色':'修改角色'}
          okText={statue==='info'?'新增':'修改'}
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="选择许可" {...formItemLayout}>
              {getFieldDecorator('permissionId', {
                rules: [{ required: true, message: '请选择许可' }],
                initialValue: statue==='info'?[]:data(modifyData),
              })(
              <Select
                 mode="multiple"
                 placeholder="请选择许可"
                 onChange={this.onChange}
               >
               {loop(treeData)}
              </Select>
              )}
            </FormItem>
            <FormItem label="角色名称" {...formItemLayout}>
              {getFieldDecorator('roleName', {
                rules: [{ required: true, message: '请填写角色名称' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="角色编码" {...formItemLayout}>
              {getFieldDecorator('roleCode', {
                rules: [{ required: true, message: '请填写角色编码' }],
              })(
                <Input disabled={statue!=='info'} />
              )}
            </FormItem>
            <FormItem label="角色描述" {...formItemLayout}>
              {getFieldDecorator('roleDesc', {
                rules: [{ required: true, message: '请填写角色描述' }],
              })(
                <Input />
              )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);
/* 弹出层结束 */
