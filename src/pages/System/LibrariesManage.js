import { Row, Col, Card, Tree, Form, Input, Tooltip, Icon, Divider, Button, message } from 'antd';
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import style from './style.less';
import { connect } from 'dva';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;


@connect(({ LibraryEntity, loading }) => ({
  LibraryEntity,
  submitting: loading.effects['LibraryEntity/add'],
}))
@Form.create()
class LibrariesManage extends PureComponent{
  state = {
    treeData: [],
    treeNode:{},
    selectKey: '0',
    expandedKeys: [],
    autoExpandParent: true,
    deleteKeys: [],
  }

  componentDidMount() {
    this.initTreeData();
  };

  initTreeData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'LibraryEntity/init',
      payload: '0',
    })
  }

  onLoadData = (treeNode) => {
    return new Promise((resolve) => {
      if (treeNode.props.children) {
        resolve();
        return;
      }
      const { dispatch } = this.props;
      dispatch({
        type: 'LibraryEntity/onload',
        payload: {
          parentCode: treeNode.props.eventKey,
          treeNode: treeNode,
        },
      })
      resolve();
    });
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      console.log(this.state.deleteKeys.indexOf(item.key),'index')
      if(this.state.deleteKeys.indexOf(item.key)>-1) {
        return <TreeNode {...item} dataRef={item} isLeaf={false} disabled={true}/>;
      }
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} dataRef={item} isLeaf={false} />;
    });
  }

  handleEdit = () => {
    const { dispatch, form } = this.props;
    console.log(form.getFieldValue("libraryName"))
    dispatch({
      type: 'LibraryEntity/edit',
      payload: {
        libraryName: form.getFieldValue("libraryName"),
        libraryCode: form.getFieldValue("libraryCode"),
      },
    })
  }

  handleDelete = () => {
    if(this.state.selectKey!=='0') {
      const { dispatch } = this.props;
      dispatch({
        type: 'LibraryEntity/delete',
        payload: this.props.LibraryEntity.treeNode.props.dataRef.key,
      })
      this.state.deleteKeys.push(this.props.LibraryEntity.treeNode.props.dataRef.key);
    }else {
      message.error("请选择要删除的节点");
    }

  }

  handleAdd = () => {
    console.log(this.props.LibraryEntity.treeNode,'node')
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if(this.props.LibraryEntity.treeNode) {
        if (!err) {
          dispatch({
            type: 'LibraryEntity/add',
            payload: {
              ...values,
              parentCode: this.state.selectKey,
            },
          })
        }
      }else {
        if (!err) {
          dispatch({
            type: 'LibraryEntity/add',
            payload: {
              ...values,
              parentCode: '0',
            },
          })
        }
      }
    });
  }

  handleSelect = (selectedKeys, info) => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'LibraryEntity/select',
      payload: {
        selectedKeys,
        info,
      },
    })
    if(info.selected) {
      form.setFieldsValue({
        libraryName:info.node.props.title,
        libraryCode:selectedKeys[0],
        createTime:info.node.props.dataRef.createTime,
      })
      this.setState({
        selectKey: selectedKeys[0],
      });
    }else {
      form.setFieldsValue({
        libraryName:'',
        libraryCode:'',
      })
      this.setState({
        selectKey: '0',
      });
    }
  }

  onExpand = (expandedKeys) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'LibraryEntity/expand',
      payload: {
        expandedKeys
      },
    })
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };
    const {
      form: { getFieldDecorator, submitting },
    } = this.props;
    return (
      <PageHeaderWrapper
        title="数据字典管理"
        content="统一修改页面展示内容"
      >
        <Row gutter={24}>
          <Col span={6}>
            <Card
              title="数据列表"
              extra={
                <span>
                  <a className={style.text} onClick={this.handleAdd}>新增</a>
                  <Divider type="vertical" />
                  <a className={style.text} onClick={this.handleEdit}>修改</a>
                  <Divider type="vertical" />
                  <a className={style.text} onClick={this.handleDelete}>删除</a>
                </span>
              }
            >
              <Tree
                showLine
                loadData={this.onLoadData}
                onSelect={this.handleSelect}
                onExpand={this.onExpand}
                expandedKeys={this.props.LibraryEntity.expandedKeys}
                autoExpandParent={this.props.LibraryEntity.autoExpandParent}
              >
                {this.renderTreeNodes(this.props.LibraryEntity.treeData)}
              </Tree>
            </Card>
          </Col>
          <Col span={18}>
            <Card
              title="数据详情"
              extra={
                <div>
                  {/* <a className={style.text} loading={submitting}>保存</a> */}
                  <Divider type="vertical" />
                  <a className={style.text} onClick={this.handleClear}>清空</a>
                </div>
              }
            >
              <Form
                hideRequiredMark
                style={{ marginTop: 8 }}
                onSubmit={this.handleSubmit}
              >
                <FormItem
                  {...formItemLayout}
                  label={
                    <span>
                      数据字典名称
                    </span>
                  }
                >
                  {getFieldDecorator('libraryName',{
                    rules: [
                      {
                        required: true,
                        message: '请输入数据字典名称',
                      },
                      {
                        max:15,
                        message: '不能超过15个字符',
                      },
                    ],
                  })(
                    <Input placeholder="请输入数据字典名称" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={
                    <span>
                      数据字典编码
                    </span>
                  }
                >
                  {getFieldDecorator('libraryCode',{
                    rules: [
                      {
                        required: true,
                        message: '请输入数据字典编码',
                      },
                      {
                        max:15,
                        message: '不能超过15个字符',
                      },
                    ],
                  })(
                    <Input placeholder="请输入数据字典编码" />
                  )}
                </FormItem>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageHeaderWrapper>
    )
  }
}
export default LibrariesManage
