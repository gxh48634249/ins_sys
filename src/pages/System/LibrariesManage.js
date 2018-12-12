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
    parentCode: '0',
    currentStatus: 'info',
  }

  componentDidMount() {
    this.initTreeData();
  };

  /** 初始化根节点 **/
  initTreeData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'LibraryEntity/init',
      payload: '0',
    })
  }

  /** 懒加载子节点 **/
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
        },
      })
      resolve();
    });
  }

  /** 数据预处理 **/
  dealData = (data) => {
    const temp = JSON.parse(JSON.stringify(data));
    if (temp.length && temp.length > 0) {
      temp.forEach(item => {
        if (item.parentCode !== '0') {
          const index = temp.findIndex(items => {
            return items.key ===item.parentCode;
          });
          if (index > -1) {
            if (temp[index].children && temp[index].children.indexOf(item) === -1) {
              temp[index].children.push(item);
            } else {
              temp[index].children = [item];
            }
          }
        }
      })
    }
    return temp.filter(item =>{
      return item.parentCode === '0';
    })
  }
  /** 父节点渲染 **/
  renderTreeNodes = (data) => {
    return this.dealData(data).map((item) => {
      if (item.children&& item.children.length>0) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderChildTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} dataRef={item} isLeaf={false} />;
    });
  }
  /** 子节点渲染 **/
  renderChildTreeNodes = (data) => {
    return data.map((item) => {
      if(this.state.deleteKeys.indexOf(item.key)>-1) {
        return <TreeNode {...item} dataRef={item} isLeaf={false} disabled={true}/>;
      }
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderChildTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} dataRef={item} isLeaf={false} />;
    });
  }

  /** 数据字典编辑 **/
  handleEdit = () => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'LibraryEntity/edit',
      payload: {
        libraryName: form.getFieldValue("libraryName"),
        libraryCode: form.getFieldValue("libraryCode"),
        parentCode: form.getFieldValue("parentCode"),
      },
    })
  }

  /** 删除数据 **/
  handleDelete = () => {
    if(this.state.selectKey!=='0') {
      const { dispatch } = this.props;
      dispatch({
        type: 'LibraryEntity/delete',
        payload: this.state.selectKey,
      })
    }else {
      message.error("请选择要删除的节点");
    }

  }

  /** 激活新增 **/
  changToInsert = () => {
    const { form } = this.props;
    form.setFieldsValue({
      parentCode: this.state.selectKey?this.state.selectKey:0,
      libraryName:'',
      libraryCode:this.state.selectKey?this.state.selectKey+'_':'',
    })
    this.setState({
      currentStatus: 'insert',
    });
  }

  /** 激活修改 **/
  changToModify = () => {
    this.setState({
      currentStatus: 'modify',
    });
  }

  /** 回车键新增 **/
  onKeyDown = e => {
    if (e.key === 'Enter') {
      this.handleAdd();
    }
  };
  /** 提交新增数据字典 **/
  handleAdd = () => {
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch({
          type: 'LibraryEntity/add',
          payload: {
            ...values,
          },
        })
      }
    });
    form.setFieldsValue({
      parentCode: this.state.selectKey?this.state.selectKey:0,
      libraryName:'',
      libraryCode:this.state.selectKey?this.state.selectKey+'_':'',
    })
  }

  /**  处理清空时间 **/
  clear = () => {
    if (this.state.currentStatus !== 'info') {
      const { form } = this.props;
      form.resetFields();
    }
  }

  /** 处理选中事件 **/
  handleSelect = (selectedKeys, info) => {
    const { form } = this.props;
    if(info.selected) {
      if (this.state.currentStatus === 'info') {
        form.setFieldsValue({
          parentCode: info.node.props.dataRef.parentCode,
          libraryName:info.node.props.title,
          libraryCode:selectedKeys[0],
          createTime:info.node.props.dataRef.createTime,
        })
      } else if (this.state.currentStatus === 'insert'){
        form.setFieldsValue({
          parentCode: selectedKeys[0],
          libraryCode:selectedKeys[0]+'_',
        })
      } else {
        form.setFieldsValue({
          parentCode: info.node.props.dataRef.parentCode,
          libraryName:info.node.props.title,
          libraryCode:selectedKeys[0],
          createTime:info.node.props.dataRef.createTime,
        })
      }
      this.setState({
        selectKey: selectedKeys[0],
      });
    }else {
      form.setFieldsValue({
        parentCode: '0',
        libraryName:'',
        libraryCode:'',
      })
      this.setState({
        selectKey: '0',
      });
    }
  }

  /** 树展开 **/
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
    /** 表单布局 **/
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
                  <a className={style.text} onClick={this.changToInsert}>新增</a>
                  <Divider type="vertical" />
                  <a className={style.text} onClick={this.changToModify}>修改</a>
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
                  <a className={style.text} onClick={this.clear}>清空</a>
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
                      父级字典编码
                    </span>
                  }
                  style={{ display: this.state.currentStatus !== 'info' ? 'block' : 'none'}}
                >
                  {getFieldDecorator('parentCode',{
                    rules: [
                      {
                        required: true,
                        message: '请输入父级字典编码',
                      },
                      {
                        max:125,
                        message: '不能超过125个字符',
                      },
                    ],
                    initialValue: this.state.parentCode,
                  })(
                    <Input/>
                  )}
                </FormItem>
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
                        max:125,
                        message: '不能超过125个字符',
                      },
                    ],
                  })(
                    <Input placeholder="点击左侧数据列表查看字典详情" disabled={this.state.currentStatus==='info'} />
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
                        max:125,
                        message: '不能超过125个字符',
                      },
                    ],
                  })(
                    <Input placeholder="点击左侧数据列表查看字典详情" disabled={this.state.currentStatus!=='insert'} onKeyDown={this.onKeyDown} />
                  )}
                </FormItem>
              </Form>
              <Row>
                <Button type="primary" htmlType="submit" onClick={this.handleAdd} style={{marginLeft: '45%',display: this.state.currentStatus === 'insert' ? 'inline' : 'none'}}>新增</Button>
                <Button type="primary" htmlType="submit" onClick={this.handleEdit} style={{marginLeft: '45%',display: this.state.currentStatus === 'modify' ? 'inline' : 'none'}}>修改</Button>
                <Button type="primary" htmlType="submit" onClick={() => {this.setState({currentStatus: 'info',})}} style={{marginLeft: '1%',display: this.state.currentStatus !== 'info' ? 'inline' : 'none'}}>取消</Button>
              </Row>
            </Card>
          </Col>
        </Row>
      </PageHeaderWrapper>
    )
  }
}
export default LibrariesManage
