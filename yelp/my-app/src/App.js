import React from 'react';
import { Button, Input, Checkbox, Modal, Dropdown, Menu } from 'antd';
import axios from 'axios';
import './App.css';

const params = {
  page: 1,
  page_size: 99999999
}
const email = localStorage.getItem('email')
const userId = localStorage.getItem('userId')
const token = localStorage.getItem('token')
export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      isSearch: false,
      searchValue: '',
      resultList: [],
      originList: [],
      categories: [],

      isShowInfo: false,
      info: {},

      isShowLogin: false,

      userId,
      email,
      token,
      password: '',

      comment: '',
    };
  }

  openSearch() {
    axios.post(`${window.$host}/place/list`, params).then(res => {
      res = res.data
      if (res.code === 200) {
        res.data = res.data.filter(item => {
          return JSON.stringify(item).includes(this.state.searchValue)
        })
        this.setState({
          isSearch: true,
          resultList: res.data,
          originList: JSON.parse(JSON.stringify(res.data))
        })
      }
    })

    axios.post(`${window.$host}/categories/list`, params).then(res => {
      res = res.data
      if (res.code === 200) {
        this.setState({
          categories: res.data
        })
      }
    })

  }

  inputChange({ target }) {
    this.setState({
      searchValue: target.value,
    })
  }

  checkboxChange(val) {
    let list = []
    if (val.length) {
      list = this.state.originList.filter(item => {
        return val.includes(Number(item.category_id))
      })
    } else {
      list = this.state.originList
    }
    this.setState({
      resultList: list
    })
  }

  viewInfo(info) {
    axios.post(`${window.$host}/reviews/list`, {
      ...params,
      location_id: info.id,
    }).then(res => {
      res = res.data
      if (res.code === 200) {
        this.setState({
          // isSearch: false,
          isShowInfo: true,
          info: {
            ...info,
            reviews: res.data
          }
        })
      }
    })
  }

  login() {
    axios.post(`${window.$host}/customers/login`, {
      email: this.state.email,
      password: this.state.password
    }).then(res => {
      res = res.data
      if (res.code === 200) {
        localStorage.setItem('userId', res.data.id)
        localStorage.setItem('email', res.data.email)
        localStorage.setItem('token', res.data.token)
        this.setState({
          userId: res.data.id,
          email: res.data.email,
          token: res.data.token,
        })
      }

      this.setState({
        isShowLogin: false,
        password: '',
      })
    })
  }

  passwordChange({ target }) {
    this.setState({
      password: target.value
    })
  }
  emailChange({ target }) {
    this.setState({
      email: target.value
    })
  }

  logout() {
    localStorage.removeItem('token')
    window.location.reload()
  }

  commentChange ({ target }) {
    this.setState({
      comment: target.value
    })
  }

  sendComment () {
    if (!this.state.comment) {return}
    if (!this.state.token) {
      return this.setState({ isShowLogin: true })
    }
    axios.post(`${window.$host}/reviews/add`, {
      location_id: this.state.info.id,
      customer_id: this.state.userId,
      text: this.state.comment,
      rating: 5,
    }).then(res => {
      res = res.data
      if (res.code === 200) {
        this.viewInfo(this.state.info)
      }
    })
  }

  render() {
    const state = this.state

    const menu = (
      <Menu onClick={this.logout.bind(this)}>
        <Menu.Item key="1">logout</Menu.Item>
      </Menu>
    );

    return (
      <div className="App">
        <div className="header">
          {
            state.token ? (
              <div>
                <Dropdown overlay={menu}><span>{state.email}</span></Dropdown>
              </div>
            ) : (
              <span onClick={() => { this.setState({ isShowLogin: true }) }}>Login</span>
            )
          }
        </div>
        <div className="cover">
          <div className="content">
            <p className="title">Yelp</p>
            <div className="input-wrap">
              <Input value={state.searchValue} onChange={this.inputChange.bind(this)} onKeyUp={(e) => {e.keyCode == 13 && this.openSearch()}} placeholder="input"></Input>
              <Button type="primary" onClick={this.openSearch.bind(this)}>Search</Button>
            </div>
          </div>
        </div>

        {
          state.isSearch ? (
            <div className="result">
              <div className="left">
                <h2>Categories</h2>
                <Checkbox.Group options={state.categories.map(item => ({ label: item.name, value: item.id }))} onChange={this.checkboxChange.bind(this)} />
              </div>
              <div className="right">
                <div className="input-wrap">
                  <Input value={state.searchValue} onChange={this.inputChange.bind(this)}  onKeyUp={(e) => {e.keyCode == 13 && this.openSearch()}} placeholder="input"></Input>
                  <Button type="primary" onClick={this.openSearch.bind(this)}>Search</Button>
                </div>
                {
                  state.resultList.map((item, index) =>
                    <div key={index} className="result-item" onClick={this.viewInfo.bind(this, item)}>
                      <div className="cover2" style={{ backgroundImage: `url(${item.cover})` }}></div>
                      <div className="info">
                        <div className="name">{item.name}</div>
                        <div className="desc">{item.description}</div>
                        <div className="l-l">Longitude:{item.longitude},Latitude:{item.latitude}</div>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          ) : undefined
        }

        {
          state.isShowInfo ? (
            <div className="info-wrap">
              <div className="info-cover" style={{ backgroundImage: `url(${state.info.cover})` }}>
                <div className="back" onClick={() => {this.setState({ isShowInfo: false })}}>{'<Back'}</div>
                <h1 className="name">{state.info.name}</h1>
                <div className="desc">{state.info.description}</div>
                <div className="l-l">Longitude:{state.info.longitude},Latitude:{state.info.latitude}</div>
              </div>
              <h2 className="tyu">Reviews</h2>
              <div className="input-wrap re">
                <Input value={state.comment} onChange={this.commentChange.bind(this)} onKeyUp={(e) => {e.keyCode == 13 && this.sendComment()}} placeholder="input"></Input>
                <Button type="primary" onClick={this.sendComment.bind(this)}>Send</Button>
              </div>
              {
                state.info.reviews.map((item, index) =>
                  <div key={index} className="reviews-item">
                    <div className="email">{item.customer.email}</div>
                    <div className="text">{item.text}</div>
                    <div className="star">{Array(Number(item.rating)).fill('★').join('')}</div>
                  </div>
                )
              }
            </div>
          ) : undefined
        }

        <Modal title="Login" visible={state.isShowLogin} onOk={this.login.bind(this)} onCancel={() => { this.setState({ isShowLogin: false }) }}>
          <div>
            <label>Email:</label>
            <Input value={state.email} onChange={this.emailChange.bind(this)}></Input>
          </div>
          <div>
            <label>Password:</label>
            <Input type="password" value={state.password} onChange={this.passwordChange.bind(this)}></Input>
          </div>
        </Modal>
      </div>
    );
  }
}
