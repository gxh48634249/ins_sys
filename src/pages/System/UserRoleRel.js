import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Icon, List, Transfer, Col, Row, Divider, Input, TreeSelect } from 'antd';

import Ellipsis from '@/components/Ellipsis';

import styles from './style.less';

const Search = Input.Search;
const TreeNode = TreeSelect.TreeNode;

@connect(({ list, loading, OrganEntity }) => ({
  list,
  loading: loading.models.list,
  OrganEntity,
}))
class UserRoleRel extends PureComponent {

  state = {
    targetKeys: [],
    expandedKeys: [],
    searchValue: '',
    organId: [],
    autoExpandParent: true,
    stateInfo: 'info',
    expand: false,
    parentCode: '0',
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  }
  componentDidMount() {
    this.initTreeData();
  }

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

  /* 点击树节点展示用户列表以及机构详情 */
  onSelect = (selectedKeys, e) => {
    // if (this.state.stateInfo!=='info') {
    //   message.warning('请先完成当前操作后再进行其操作！')
    // }else {
    // }
    if (e.selected) {
      this.state.organId = e.node.props.dataRef.organId;
      this.state.stateInfo = 'info';
      this.state.parentCode = e.node.props.dataRef.organCode;
      this.forceUpdate();
      this.getUser();
    }else {
      this.state.organId = '0';
      this.state.stateInfo = 'info';
      this.state.parentCode = '0';
      this.forceUpdate();
    }
  }
  /* 机构变化是检索用户 */
  handleOrganChange = (value) => {
    let organId = [];
    value.forEach(item => {
      organId.push(this.props.OrganEntity.organMap[item]);
    })
    this.setState({
      organId
    })
  }

  /* 获取用户 */
  getUser = (e) => {
    this.setState({
      searchValue: e.target.value,
    });
    const { pagination, organId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'OrganEntity/selectUser',
      payload: {
        userName: e.target.value,
        pageInfo: {
          pageSize: 10000,
          pageNum: 0,
        },
        organId: organId.join(","),
      },
    }).then(
      this.setState({
        pagination: this.props.OrganEntity.pagination,
      })
    )

  }

  render() {
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode value={item.dataRef.organName} title={item.title} key={item.dataRef.organId} >
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode value={item.dataRef.organName} title={item.title} key={item.dataRef.organId} />;
    });
    const { searchValue, expandedKeys, autoExpandParent } = this.state;
    return (
      <Row>
        <Col span={8}>
          <Card title="用户列表">
            <TreeSelect
              showSearch
              style={{ width: 283 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择机构"
              allowClear
              onChange={this.handleOrganChange}
              treeDefaultExpandAll
              multiple
            >
              {loop((this.props.OrganEntity.treeData&&this.props.OrganEntity.treeData.length>0)?this.props.OrganEntity.treeData:[])}
            </TreeSelect>
            <Search style={{ width: 300 }} style={{ marginBottom: 8 }} placeholder="用户名称/联系方式" onChange={this.onChange} onPressEnter={this.getUser} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="用户角色管理">

          </Card>
        </Col>
      </Row>

    );
  }
}

export default UserRoleRel;
