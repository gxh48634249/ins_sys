import { Table, Badge, Menu, Dropdown, Icon, Card, Divider, Form, Input, Button, Modal, Radio, message, Popconfirm } from 'antd';
import style from './style.less';
import React from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);


/***
 * 可编辑单元格
 */
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

  /* 修改状态 */
  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  }

  /* 点击空白处保存 */
  handleClickOutside = (e) => {
    const { editing } = this.state;
    if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
      this.save();
    }
  }

  /* 保存 */
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
                        message: `请填写： ${title}.`,
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
                    className={style['editable-cell-value-wrap']}
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
/* 可编辑单元格结束 */

/***
 * 主体页面
 */
@connect(({ ResourceEntity, loading }) => ({
  ResourceEntity,
}))
class ResourceManage extends React.Component {

  state = {
    pageInfo: {
      pageSize: 10,
      pageNum: 0,
      totalInfo: 0,
      totalPage: 0,
    },
    expandedRows: [],
    visible: false,
    resourceParentCode: '0',
    resourceParentName: '根目录',
  }

  componentDidMount() {
    this.initData();
  };

  /* 弹出层展示 */
  showModal = () => {
    this.setState({ visible: true });
  }

  /* 弹出层隐藏 */
  handleCancel = () => {
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
        resourceParentCode: this.state.resourceParentCode,
      })
      form.resetFields();
      this.setState({ visible: false });
    });
  }

  initData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ResourceEntity/initLibraryMap',
      payload: {
        parentCode: 'resourceType',
      },
    })
    dispatch({
      type: 'ResourceEntity/selectResource',
      payload: this.state.pageInfo,
    })
  }

  handleAdd = (value) => {
    console.log(value,'请求')
    const { dispatch } = this.props;
    dispatch({
      type: 'ResourceEntity/insertResource',
      payload: {...value},
    })
  }

  handleSave = (row) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ResourceEntity/modifyResource',
      payload: {
        ...row
      },
    })
  }

  onExpand = (expanded, record) => {
  }

  handleSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  handleReset = () => {
    this.setState({
      resourceParentCode: '0',
      resourceParentName: '根目录',
    });
    message.info("当前选择： 根目录");
  }

  handleDelete = (record) => {
    if(record.children&&record.children.length>0) {
      message.warning("当前资源包含子资源，请清空子资源后再试！")
      return
    }else {
      const { dispatch } = this.props;
      dispatch({
        type: 'ResourceEntity/deleteResource',
        payload: {
          resourceId: record.resourceId,
          resourceCode: record.resourceCode,
        },
      })
    }
  }

  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = [
      { title: '资源名称(E)', dataIndex: 'resourceName', key: 'resourceName', editable: true,},
      { title: '资源编码', dataIndex: 'resourceCode', key: 'resourceCode', },
      { title: '资源描述(E)', dataIndex: 'resourceDes', key: 'resourceDes', editable: true},
      { title: '资源路径', dataIndex: 'resourcePath', key: 'resourcePath', },
      { title: '资源类型', dataIndex: 'resourceType', key: 'resourceType' },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record) => {
          return (
            this.props.ResourceEntity.resourceData.length >= 1
              ? (
                <div>
                  <Popconfirm title="确认删除?" onConfirm={() => this.handleDelete(record)}>
                    <a href="javascript:;">删除</a>
                  </Popconfirm>
                  <Divider type="vertical" />
                  <a>编辑权限</a>
                </div>
              ) : null
          );
        },
      },
    ];
    const column = columns.map((col) => {
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
    return (
      <PageHeaderWrapper
        title="资源管理"
        content="管理系统资源信息"
      >
        <Card title="资源列表" extra={
          <div>
            <a className={style.text} onClick={this.showModal}>新增</a>
            <Divider type="vertical" />
            <a className={style.text} onClick={this.handleReset}>重置</a>
            <CollectionCreateForm
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.visible}
              onCancel={this.handleCancel}
              onCreate={this.handleCreate}
              resourceParentName={this.state.resourceParentName}
            />
          </div>
        }>
          <Table
            components={components}
            className={style['components-table-demo-nested']}
            columns={column}
            onExpand={this.onExpand}
            dataSource={this.props.ResourceEntity.resourceData}
            pagination={false}
            onRow={(record) => {
              return {
                onDoubleClick: () => {
                  message.info('当前选择：'+record.resourceName)
                  this.setState({
                    resourceParentCode: record.resourceCode,
                    resourceParentName: record.resourceName,
                  })
                },
              };
            }}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResourceManage
/* 主体页面结束 */

/***
 * 弹出层展示（用于新增资源信息）
 */
const CollectionCreateForm = Form.create()(
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form, resourceParentName } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="新增资源信息"
          okText="新增"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="父资源名称">
              <Input value={resourceParentName} disabled={true}/>
            </FormItem>
            <FormItem label="资源名称">
              {getFieldDecorator('resourceName', {
                rules: [{ required: true, message: '请填写资源名称' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="资源编码">
              {getFieldDecorator('resourceCode', {
                rules: [{ required: true, message: '请填写资源编码' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="资源描述">
              {getFieldDecorator('resourceDes', {
                rules: [{ required: true, message: '请填写资源描述' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="资源路径">
              {getFieldDecorator('resourcePath', {
                rules: [{ required: true, message: '请填写资源路径' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem className="collection-create-form_last-form-item" label="资源类型">
              {getFieldDecorator('resourceType', {
                initialValue: 'system',
              })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="system">系统</Radio.Button>
                  <Radio.Button value="subSystem">子系统</Radio.Button>
                  <Radio.Button value="model">模块</Radio.Button>
                  <Radio.Button value="subModel">子模块</Radio.Button>
                  <Radio.Button value="function">方法</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);
/* 弹出层结束 */
