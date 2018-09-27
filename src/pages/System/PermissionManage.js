/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from 'umi/router';
import { connect } from 'dva';
import { Input } from 'antd';

const Search = Input.Search;
@connect()
class PermissionManage extends PureComponent {

  componentDidMount() {
    const { match } = this.props;
    router.push(`${match.url}/rolepermissionrel`);
  }

  handleTabChange = key => {
    const { match } = this.props;
    switch (key) {
      case 'rolepermissionrel':
        router.push(`${match.url}/rolepermissionrel`);
        break;
      case 'userrolerel':
        router.push(`${match.url}/userrolerel`);
        break;
      default:
        break;
    }
  };

  render() {
    const { match, children, location } = this.props;
    const tabList = [
      {
        key: 'rolepermissionrel',
        tab: '角色许可管理',
      },
      {
        key: 'userrolerel',
        tab: '用户角色管理',
      },
    ];
    return (
      <PageHeaderWrapper
        title="权限管理"
        tabList={tabList}
        tabActiveKey={location.pathname.replace(`${match.path}/`, '')}
        onTabChange={this.handleTabChange}
      >
        {children}
      </PageHeaderWrapper>
    )
  }
}
export default PermissionManage;
