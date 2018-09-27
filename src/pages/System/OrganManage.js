import { Card, Table, Input, Button, Popconfirm, Form, Badge, Menu, Dropdown, Icon, Divider, Row, Col, Tree, message } from 'antd';
import React from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import style from './style.less';
import { connect } from 'dva';
import { msToDate } from '@/utils/utils';

const TreeNode = Tree.TreeNode;
const Search = Input.Search;
const FormItem = Form.Item;

/***
 * 机构详情组件-开始
 */
class AdvancedSearchForm extends React.Component {

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
    });
  }

  handleReset = () => {
    this.props.form.resetFields(this.props.field.map(item => {
      return item.disabled ? null:item.key;
    }));
  }

  // To generate mock Form.Item
  getFields() {
    const field = this.props.field;
    const count = this.props.expand ? 6 : 3;
    const { getFieldDecorator } = this.props.form;
    const children = [];
    field.forEach((item, index) => {
      if(this.props.stateInfo==='新增'&&item.required) {
        children.push(
          <Col span={8} key={index} style={{ display: 'block'}}>
            <FormItem label={`${item.name}`}>
              {getFieldDecorator(`${item.key}`, {
                rules: [{
                  required: item.required,
                  message: '请输入'+item.name,
                }],
              })(
                <Input placeholder={item.name} disabled={item.key==='parentCode'?true:false} />
              )}
            </FormItem>
          </Col>
        );
      }else if(this.props.stateInfo==='info') {
        children.push(
          <Col span={8} key={index} style={{ display: index < count ? 'block' : 'none' }}>
            <FormItem label={`${item.name}`}>
              {getFieldDecorator(`${item.key}`, {
                rules: [{
                  required: item.required,
                  message: '请输入'+item.name,
                }],
              })(
                <Input placeholder={item.name} disabled={true} />
              )}
            </FormItem>
          </Col>
        );
      }else if(this.props.stateInfo==='修改') {
        children.push(
          <Col span={8} key={index} style={{ display: index < count ? 'block' : 'none' }}>
            <FormItem label={`${item.name}`}>
              {getFieldDecorator(`${item.key}`, {
                rules: [{
                  required: item.required,
                  message: '请输入'+item.name,
                }],
              })(
                <Input placeholder={item.name} disabled={item.disabled} />
              )}
            </FormItem>
          </Col>
        );
      }
    })
    return children;
  }

  bottom () {
    const { submit, toggle } = this.props
    if (this.props.stateInfo==='info') {
      return (
        <Col span={24} style={{ textAlign: 'right' }}>
          <a style={{ marginLeft: 8, fontSize: 12 }} onClick={toggle}>
            {this.props.expand ? '收起' : '展开'} <Icon type={this.props.expand ? 'up' : 'down'} />
          </a>
        </Col>
      );
    }else if (this.props.stateInfo==='新增') {
      return (
        <Col span={24} style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" onClick={submit}>新增</Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
            清空
          </Button>
        </Col>
      );
    }else if (this.props.stateInfo==='修改') {
      return (
        <Col span={24} style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" onClick={submit}>修改</Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
            清空
          </Button>
          <a style={{ marginLeft: 8, fontSize: 12 }} onClick={toggle}>
            {this.props.expand ? '收起' : '展开'} <Icon type={this.props.expand ? 'up' : 'down'} />
          </a>
        </Col>
      );
    }
  }

  render() {
    const { submit, toggle } = this.props
    return (
      <Form
        hideRequiredMark
        className={style['ant-advanced-search-form']}
        onSubmit={this.handleSearch}
      >
        <Row gutter={24}>{this.getFields()}</Row>
        <Row>
          {this.bottom()}
        </Row>
      </Form>
    );
  }
}
/***
 * 机构详情组件-结束
 */

/***
 * 机构管理主体页面-开始
 */
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);
@connect(({ OrganEntity, loading }) => ({
  OrganEntity,
}))
class OrganManage extends React.Component {

  /* 定义页面所需常量 */
  state = {
    expandedKeys: [],
    searchValue: '',
    autoExpandParent: true,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    organId: '',
    userSearchValue: '',
    field: [
      {
        key: 'organId',
        name: '组织机构主键',
        disabled: true,
        required: false,
      },
      {
        key: 'organName',
        name: '组织机构名称',
        disabled: false,
        required: true,
      },
      {
        key: 'organCode',
        name: '组织机构编码',
        disabled: true,
        required: true,
      },
      {
        key: 'organDesc',
        name: '组织机构描述',
        disabled: false,
        required: true,
      },
      {
        key: 'createTime',
        name: '创建时间',
        disabled: true,
        required: false,
      },
      {
        key: 'parentCode',
        name: '父机构信息',
        disabled: true,
        required: true,
      },
    ],
    stateInfo: 'info',
    expand: false,
    parentCode: '0',
  }

  /* 数据初始化挂载点 */
  componentDidMount() {
    this.initTreeData();
  };

  /* 数据初始化 */
  initTreeData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'OrganEntity/selectAllOrgan',
      payload: '0',
    })
  }

  /* 树结构展开 */
  onExpand = (expandedKeys,event) => {
    if(event.node.props.children&&event.node.props.children.length>0) {
      this.setState({
        expandedKeys,
        autoExpandParent: false,
      });
    }else {
      expandedKeys.splice(-1,1);
      this.setState({
        expandedKeys,
        autoExpandParent: false,
      });
    }
  }

  /* 用户名搜索 */
  onChangeUserName = (value) => {
    this.state.userSearchValue = value;
    this.forceUpdate();
    this.getUser();
  }

  /* 树结构搜索 */
  onChange = (e) => {
    const dataList = [];
    const generateList = (data) => {
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const key = node.key;
        const parentKey = node.parentKey;
        dataList.push({ ...node });
        if (node.children) {
          generateList(node.children, node.key);
        }
      }
    };
    generateList(this.props.OrganEntity.treeData);
    const value = e.target.value;
    const expandedKeys = dataList.map((item) => {
      if (item.title.indexOf(value) > -1) {
        return item.parentKey;
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  }

  /* 页码搜索 */
  onTableChange(pagination) {
    this.state.pagination = pagination;
    this.forceUpdate();
    this.getUser();
  }

  /* 点击树节点展示用户列表以及机构详情 */
  onSelect = (selectedKeys, e) => {
    // if (this.state.stateInfo!=='info') {
    //   message.warning('请先完成当前操作后再进行其操作！')
    // }else {
    // }
    const form = this.formRef.props.form;
    if (e.selected) {
      this.state.organId = e.node.props.dataRef.organId;
      this.state.stateInfo = 'info';
      this.state.parentCode = e.node.props.dataRef.organCode;
      this.forceUpdate();
      this.getUser();
      const form = this.formRef.props.form;
      form.setFieldsValue({
        ...e.node.props.dataRef,
        createTime: msToDate(e.node.props.dataRef.createTime).hasTime,
      })
    }else {
      this.state.organId = '0';
      this.state.stateInfo = 'info';
      this.state.parentCode = '0';
        this.forceUpdate();
      form.resetFields();
    }
  }

  /* 获取用户 */
  getUser = () => {
    const { userSearchValue, pagination, organId } = this.state;
    console.log(userSearchValue,pagination,organId,'请求参数')
    const { dispatch } = this.props;
    dispatch({
      type: 'OrganEntity/selectUser',
      payload: {
        userName: userSearchValue,
        pageInfo: {
          pageSize: pagination.pageSize,
          pageNum: pagination.current-1,
        },
        organId: organId,
      },
    }).then(
      this.setState({
        pagination: this.props.OrganEntity.pagination,
      })
    )

  }

  /* 机构详情展开收起 */
  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  /* 机构增删改 */
  submit = (value) => {
    const form = this.formRef.props.form;
    const { dispatch } = this.props;
    form.validateFields((err, values) => {
      if (this.state.stateInfo==='新增') {
        dispatch({
          type: 'OrganEntity/insertOrgan',
          payload: {
            ...values,
            parentCode: this.state.parentCode,
          },
        })
      }else if(this.state.stateInfo==='修改') {
        dispatch({
          type: 'OrganEntity/modifyOrgan',
          payload: {
            ...values,
            parentCode: this.state.parentCode,
            createTime: null,
          },
        })
      }else {
        if (this.state.organId==='0'){
          message.warning('请选择需要删除的数据！')
        }else {
          dispatch({
            type: 'OrganEntity/deleteOrgan',
            payload: {
              organId: this.state.organId,
              organCode: this.state.parentCode
            },
          })
        }
      }
    });
    this.setState({
      stateInfo: 'info',
    })
  }

  /* 新增机构 */
  handleAdd = () => {
    if (this.state.stateInfo!=='info') {
      message.warning('请先完成当前操作后再进行其操作！')
    }else {
      const form = this.formRef.props.form;
      const entity = form.getFieldsValue();
      this.setState({
        stateInfo: '新增',
      })
      form.resetFields();
      if (entity.organName) {
        form.setFieldsValue({
          parentCode: entity.organName+' / '+entity.organCode,
        })
      }else {
        form.setFieldsValue({
          parentCode: '根目录 / 0',
        })
      }
    }
  }

  /* 修改机构 */
  handleModify = () => {
    if (this.state.stateInfo!=='info') {
      message.warning('请先完成当前操作后再进行其操作！')
    }else {
      this.setState({
        stateInfo: '修改',
        expand: true,
      })
    }
  }

  /* 表单关联 */
  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  render() {
    /* 定义表头 */
    const columns = [
      {
        title: '账户',
        dataIndex: 'userAccount',
        width: '20%',
        // fixed: 'left'
      },
      {
        title: '用户姓名',
        dataIndex: 'userName',
        width: '20%',
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        width: '20%',
      },
      {
        title: '邮箱',
        dataIndex: 'mail',
        width: '20%',
      },
    ];
    const { searchValue, expandedKeys, autoExpandParent } = this.state;

    /* 搜索结果高亮 */
    const loop = data => data.map((item) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.title}</span>;
      if (item.children) {
        return (
          <TreeNode {...item} title={title} >
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} title={title} isLeaf={true} />;
    });
    return (

      <PageHeaderWrapper
        title="机构管理"
        content="管理系统内机构信息"
      >
        <Row gutter={24}>
          <Col span={6}>
            <Card title="机构列表" extra={
              <div>
                <a className={style.text} onClick={this.handleAdd}>新增</a>
                <Divider type="vertical" />
                <a className={style.text} onClick={this.handleModify}>修改</a>
                <Divider type="vertical" />
                <a className={style.text} onClick={this.submit}>删除</a>
              </div>
            }>
              <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onChange} />
              <Tree
                showLine
                onExpand={this.onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onSelect={this.onSelect}
              >
                {loop(this.props.OrganEntity.treeData)}
              </Tree>
            </Card>
          </Col>
          <Col span={18}>
            <Row gutter={24}>
              <Col span={24}>
                <Card title="机构详情"
                //       extra={
                //   <div>
                //     <a className={style.text} onClick={this.handleAdd}>新增</a>
                //     <Divider type="vertical" />
                //     <a className={style.text}>修改</a>
                //     <Divider type="vertical" />
                //     <a className={style.text}>删除</a>
                //   </div>
                // }
                >
                  <WrappedAdvancedSearchForm
                    field={this.state.field}
                    submit={this.submit}
                    stateInfo={this.state.stateInfo}
                    expand={this.state.expand}
                    toggle={this.toggle}
                    wrappedComponentRef={this.saveFormRef}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card title="归属用户" extra={
                  <div>
                    <Search placeholder="Search" onSearch={this.onChangeUserName} />
                    {/*<a className={style.text} onClick={this.handleAdd}>新增</a>*/}
                    {/*<Divider type="vertical" />*/}
                    {/*<a className={style.text}>修改</a>*/}
                    {/*<Divider type="vertical" />*/}
                    {/*<a className={style.text}>删除</a>*/}
                  </div>
                }>
                  <Table
                    columns={columns}
                    dataSource={this.props.OrganEntity.dataSource}
                    pagination={this.state.pagination}
                    onChange={this.onTableChange}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default OrganManage;
/***
 * 机构管理主体页面-结束
 */
