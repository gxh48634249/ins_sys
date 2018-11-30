import { Card, Table, Input, Button, Popconfirm, Form, Row, Col, Divider, Radio, Modal, DatePicker, TreeSelect, Select, LocaleProvider, message } from 'antd';
import React from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import style from './style.less';
import { connect } from 'dva';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh');

const Option = Select.Option;
const Search = Input.Search;
const FormItem = Form.Item;
const EditableContext = React.createContext();
const TreeNode = TreeSelect.TreeNode;
const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

/* 可编辑单元格-开始 */
const EditableFormRow = Form.create()(EditableRow);
class EditableCell extends React.Component {
  state = {
    editing: false,
  }

  componentDidMount() {
    if (this.props.editable) {
      document.addEventListener('click', this.handleClickOutside, true);
    }
  }

  componentWillUnmount() {
    if (this.props.editable) {
      document.removeEventListener('click', this.handleClickOutside, true);
    }
  }

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  }

  handleClickOutside = (e) => {
    const { editing } = this.state;
    if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
      this.save();
    }
  }

  save = () => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  }

  render() {
    const { editing } = this.state;
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      ...restProps
    } = this.props;
    return (
      <td ref={node => (this.cell = node)} {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form) => {
              this.form = form;
              return (
                editing ? (
                  <FormItem style={{ margin: 0 }}>
                    {form.getFieldDecorator(dataIndex, {
                      rules: [{
                        required: true,
                        message: `${title} is required.`,
                      }],
                      initialValue: record[dataIndex],
                    })(
                      <Input
                        ref={node => (this.input = node)}
                        onPressEnter={this.save}
                      />
                    )}
                  </FormItem>
                ) : (
                  <div
                    className="editable-cell-value-wrap"
                    style={{ paddingRight: 24 }}
                    onClick={this.toggleEdit}
                  >
                    {restProps.children}
                  </div>
                )
              );
            }}
          </EditableContext.Consumer>
        ) : restProps.children}
      </td>
    );
  }
}
/* 可编辑单元格-结束 */


/***
 * 主体信息-开始
 */
@connect(({ UserEntity, loading, OrganEntity }) => ({
  UserEntity,
  OrganEntity,
}))
@Form.create()
class UserManage extends React.Component {
  state = {
    search: true,
    selected: false,
    searchValue: {
      userName: '',
      userStatue: '',
    },
    visible: false,
    selectedRowKeys: [],
  }

  /* 初始化数据挂载点 */
  componentDidMount() {
    this.initTreeData();
  };

  /* 初始化数据 */
  initTreeData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'OrganEntity/selectAllOrgan',
      payload: '0',
    })
    dispatch({
      type: 'UserEntity/initLibraryMap',
      payload: {
        parentCode: 'userStatue',
      },
    })
    dispatch({
      type: 'UserEntity/selectUser',
      payload: {
        pageInfo: {
          pageSize: this.props.UserEntity.pagination.pageSize,
          pageNum: this.props.UserEntity.pagination.current-1,
        }
      },
    });
  }

  /* 删除数据 */
  handleDelete = () => {
    if(!this.state.selectedRowKeys||this.state.selectedRowKeys.length<1) {
      message.info("请先激活选择,并点选需要删除的数据后再进行删除!")
    }else {
      const { dispatch } = this.props;
      this.setState({
        selectedRowKeys: [],
      })
      dispatch({
        type: 'UserEntity/deleteUser',
        payload: {
          userInfoEntity: {
            userId:this.state.selectedRowKeys.join()
          },
        },
      })
    }
  }

  /* 新增信息 */
  handleAdd = (entity) => {
    const { dispatch } = this.props;
    entity = {
      ...entity,
      expiredTime: entity.expiredTime._d.getTime(),
    }
    dispatch({
      type: 'UserEntity/insertUser',
      payload: {
        userInfoEntity: {
          ...entity,
        },
        organId: entity.organId,
      },
    })
  }

  /* 边界结果保存处理 */
  handleSave = (row) => {
    console.log(row,'编辑');
    const { dispatch } = this.props;
    dispatch({
      type: 'UserEntity/modifyUser',
      payload: {
        userInfoEntity: {
          ...row,
        }
      },
    })
  }

  /* 搜索框展开 */
  expandSearch = () => {
    this.setState({
      search: !this.state.search,
    })
  }

  /* 激活选择框 */
  selected = () => {
    this.setState({
      selected: !this.state.selected,
      selectedRowKeys: [],
    })
  }

  /* 锁定用户 */
  handleLock = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'UserEntity/changeUserStatue',
      payload: {
        userInfoEntity: {
          userId: record.userId,
          userStatue: 2,
          userStatueS: this.props.UserEntity.userStatue[2],
        }
      },
    })
  }

  /* 移入黑名单 */
  handleBlack = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'UserEntity/changeUserStatue',
      payload: {
        userInfoEntity: {
          userId: record.userId,
          userStatue: 3,
          userStatueS: this.props.UserEntity.userStatue[3]
        }
      },
    })
  }

  /* 激活用户 */
  handleUse = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'UserEntity/changeUserStatue',
      payload: {
        userInfoEntity: {
          userId: record.userId,
          userStatue: 1,
          userStatueS: this.props.UserEntity.userStatue[1]
        }
      },
    })
  }

  /* 处理搜索 */
  handleSubmit = (pagination) => {
    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      this.setState({
        searchValue: {...values}
      })
      dispatch({
        type: 'UserEntity/selectUserEasy',
        payload: {
          userInfoEntity: {
            ...values,
          },
          pageInfo: {
            pageSize: this.props.UserEntity.pagination.pageSize,
            pageNum: pagination.current-1,
          }
        },
      })
    });
  }

  /* 弹出层展示 */
  showModal = () => {
    this.setState({ visible: true });
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
      this.handleAdd({
        ...values,
      })
      form.resetFields();
      this.setState({ visible: false });
    });
  }

  render() {

    /* 定义表头 */
    const column = [
      {
        title: '登录账户',
        dataIndex: 'userAccount',
        fixed: 'left',
        width: 100,
      },
      {
        title: '用户姓名(E)',
        dataIndex: 'userName',
        editable: true,
      },
      {
        title: '所属机构',
        dataIndex: 'organName',
      },
      {
        title: '联系方式(E)',
        dataIndex: 'phone',
        editable: true,
      },
      {
        title: '性别',
        dataIndex: 'gender',
      },
      {
        title: '用户状态',
        dataIndex: 'userStatueS',
      },
      {
        title: '过期时间',
        dataIndex: 'expiredTimeS',
      },
      {
        title: '创建时间',
        dataIndex: 'createTimeS',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        fixed: 'right',
        width: 150,
        render: (text, record) => {
          const lock = () => {
            record.userStatue = 2;
          }

          return (
            <span>
              <a className={style.infoText} onClick={() => {
                this.handleUse(record);
              }}>激活</a>
              <Divider type="vertical" />
              <a className={style.text} onClick={() => {
                this.handleBlack(record);
              }}>拉黑</a>
              <Divider type="vertical" />
              <a className={style.worningText} onClick={() => {
                this.handleLock(record);
              }}>锁定</a>
            </span>
          );
        },
      }
    ];
    /* 编辑状态下的表格定义 */
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    /* 可编辑单元格处理 */
    const columns = column.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    /* 搜索栏布局 */
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 },
    };

    const { getFieldDecorator } = this.props.form;

    /* 激活选择时相关操作 */
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          selectedRowKeys,
        })
      },
    };

    /* 生成搜索框用户状态可搜索项 */
    const radios = Object.keys(this.props.UserEntity.userStatue).map(item => {
      return <Radio.Button value={item} key={item}>{this.props.UserEntity.userStatue[item]}</Radio.Button>;
    })

    return (

      <PageHeaderWrapper
        title="用户管理"
        content="管理系统内用户信息"
      >
        <Card title="用户列表" extra={
          <div>
            <Divider type="vertical" />
            <a className={style.text} onClick={this.expandSearch} >{this.state.search?'收起搜索':'展开搜索'}</a>
            <Divider type="vertical" />
            <a className={style.text} onClick={this.selected} >{this.state.selected?'取消选择':'选择'}</a>
            <Divider type="vertical" />
            <a className={style.text} onClick={this.showModal}>新增</a>
            <Divider type="vertical" />
            <a className={style.text} onClick={this.handleDelete}>删除</a>
            <Divider type="vertical" />
            <a className={style.text}>重置密码</a>
            <CollectionCreateForm
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.visible}
              onCancel={this.handleCancel}
              onCreate={this.handleCreate}
              treeData={this.props.OrganEntity.treeData}
            />
          </div>
        }>
          <div className="table-operations" style={{ display: this.state.search?'block':'none'}}>
            <Form layout="inline">
              <FormItem
                label="关键词检索"
              >
                {getFieldDecorator('userName')(
                  <Search placeholder="用户名/账户" onSearch={this.handleSubmit} />
                )}
              </FormItem>
              <FormItem
                label="用户状态"
              >
                {getFieldDecorator('userStatue',{
                  initialValue: "-1"
                })(
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button value="-1">全部</Radio.Button>
                    {radios}
                  </Radio.Group>
                )}
              </FormItem>
            </Form>
          </div>
          <Table
            components={components}
            rowClassName={style['editable-row']}
            dataSource={this.props.UserEntity.data}
            columns={columns}
            pagination={this.props.UserEntity.pagination}
            onChange={this.handleSubmit}
            scroll={{ x: 1300 }}
            rowSelection={this.state.selected?rowSelection:null}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}
/***
 * 主体信息-结束
 */


export default UserManage;

/***
 * 弹出层展示（用于新增用户信息）
 */
const CollectionCreateForm = Form.create()(
  class extends React.Component {

    state = {
      gender: {},
      organ: [],
      role: [],
      value: undefined,
    }

    onChange = (value) => {
      console.log(value);
      this.setState({ value });
    }

    render() {
      const loop = data => data.map((item) => {
        if (item.children) {
          return (
            <TreeNode value={item.dataRef.organId} title={item.title} key={item.dataRef.organId} >
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode value={item.dataRef.organId} title={item.title} key={item.dataRef.organId} />;
      });
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
      const { visible, onCancel, onCreate, form, treeData } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="新增用户"
          okText="新增"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="选择机构" {...formItemLayout}>
              {getFieldDecorator('organId', {
                rules: [{ required: true, message: '请选择机构' }],
              })(
                <TreeSelect
                  showSearch
                  style={{ width: 300 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择机构"
                  allowClear
                  setFieldsValue={this.state.value}
                  treeDefaultExpandAll
                  onChange={this.onChange}
                >
                  {loop((treeData&&treeData.length>0)?treeData:[])}
                </TreeSelect>
              )}
            </FormItem>
            <FormItem label="登录账户" {...formItemLayout}>
              {getFieldDecorator('userAccount', {
                rules: [{ required: true, message: '请填写登录账户' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="用户姓名" {...formItemLayout}>
              {getFieldDecorator('userName', {
                rules: [{ required: true, message: '请填写用户姓名' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="联系方式" {...formItemLayout}>
              {getFieldDecorator('phone', {
                rules: [{ required: true, message: '请填写联系方式' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="选择性别" {...formItemLayout}>
              {getFieldDecorator('gender', {
                rules: [{ required: true, message: '请选择性别' }],
              })(
                <Radio.Group>
                  <Radio value='1'>男</Radio>
                  <Radio value='2'>女</Radio>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem label="过期时间" {...formItemLayout}>
              {getFieldDecorator('expiredTime', {
                rules: [{ required: true, message: '请选择过期时间' }],
              })(
                <DatePicker locale={zhCN} />
              )}
            </FormItem>
            <FormItem label="登录密码" {...formItemLayout}>
              {getFieldDecorator('userPwd', {
                rules: [{ required: true, message: '请填写登录密码' }],
              })(
                <Input type="password" />
              )}
            </FormItem>
            <FormItem label="确认密码" {...formItemLayout}>
              {getFieldDecorator('userPwdR', {
                rules: [
                  { required: true, message: '请再次确认密码' },
                  { pattern: form.getFieldValue('userPwd'), message: '两次密码输入不相同,请重新输入' }
                ],
              })(
                <Input type="password" />
              )}
            </FormItem>
            <FormItem label="选择权限" {...formItemLayout}>
              {getFieldDecorator('roleIds', {
                rules: [
                  { required: true, message: '请选择权限' },
                ],
                initialValue: '1',
              })(
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Please select"
                >
                  <Option key='1'>1</Option>
                  <Option key='2'>2</Option>
                  <Option key='3'>3</Option>
                  <Option key='4'>4</Option>
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);
/* 弹出层结束 */
