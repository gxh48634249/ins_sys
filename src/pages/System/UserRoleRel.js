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
    mockData: [],
    targetKeys: [],
    expandedKeys: [],
    searchValue: '',
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
    this.getMock();
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

  /* 获取用户 */
  getUser = () => {
    const { userSearchValue, pagination, organId } = this.state;
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

  getMock = () => {
    const targetKeys = [];
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      const data = {
        key: i.toString(),
        title: `content${i + 1}`,
        description: `description of content${i + 1}`,
        chosen: Math.random() * 2 > 1,
      };
      if (data.chosen) {
        targetKeys.push(data.key);
      }
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys });
  }

  filterOption = (inputValue, option) => {
    return option.description.indexOf(inputValue) > -1;
  }

  handleChange = (targetKeys) => {
    this.setState({ targetKeys });
  }

  render() {
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode value={item.title} title={item.title} key={item.dataRef.organId} >
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode value={item.title} title={item.title} key={item.dataRef.organId} />;
    });
    const { searchValue, expandedKeys, autoExpandParent } = this.state;
    return (
      <Row>
        <Col span={6}>
          <Card title="用户列表">
            <TreeSelect
              showSearch
              style={{ width: 300 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择机构"
              allowClear
              setFieldsValue={this.state.value}
              treeDefaultExpandAll
              multiple
            >
              {loop((this.props.OrganEntity.treeData&&this.props.OrganEntity.treeData.length>0)?this.props.OrganEntity.treeData:[])}
            </TreeSelect>
            <Search style={{ width: 300 }} style={{ marginBottom: 8 }} placeholder="查询机构" onChange={this.onChange} />
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
