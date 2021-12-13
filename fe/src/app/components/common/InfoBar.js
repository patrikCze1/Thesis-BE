import React from "react";
import { Tabs, Tab } from "react-bootstrap";

export default function InfoBar() {
  const closeRightSidebar = () => {
    document.querySelector(".right-sidebar").classList.remove("open");
  };

  return (
    <div>
      {/* <div id="settings-trigger">
        <i className="mdi mdi-settings"></i>
      </div> */}
      <div id="right-sidebar" className="settings-panel right-sidebar">
        <i
          className="settings-close mdi mdi-close"
          onClick={closeRightSidebar}
        ></i>
        <Tabs
          defaultActiveKey="TODOLIST"
          className="bg-primary"
          id="uncontrolled-tab-example"
        >
          <Tab eventKey="TODOLIST" title="TO DO LIST" className="test-tab">
            <div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="px-3">
                    <div>
                      <h4 className="card-title">Todo List</h4>

                      <div className="list-wrapper">
                        <ul className="d-flex flex-column todo-list"></ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="events py-4 border-bottom px-3">
                <div className="wrapper d-flex mb-2">
                  <i className="mdi mdi-circle-outline text-primary mr-2"></i>
                  <span>Feb 11 2018</span>
                </div>
                <p className="mb-0 font-weight-thin text-gray">
                  Creating component page
                </p>
                <p className="text-gray mb-0">build a js based app</p>
              </div>
              <div className="events pt-4 px-3">
                <div className="wrapper d-flex mb-2">
                  <i className="mdi mdi-circle-outline text-primary mr-2"></i>
                  <span>Feb 7 2018</span>
                </div>
                <p className="mb-0 font-weight-thin text-gray">
                  Meeting with Alisa
                </p>
                <p className="text-gray mb-0 ">Call Sarah Graves</p>
              </div>
            </div>
          </Tab>
          <Tab eventKey="CHATS" title="CHATS">
            <div>
              <div className="d-flex align-items-center justify-content-between border-bottom">
                <p className="settings-heading border-top-0 mb-3 pl-3 pt-0 border-bottom-0 pb-0">
                  FRIENDS
                </p>
                <small className="settings-heading border-top-0 mb-3 pt-0 border-bottom-0 pb-0 pr-3 font-weight-normal">
                  See All
                </small>
              </div>
              <ul className="chat-list">
                <li className="list active">
                  <div className="profile">
                    <img
                      src={require("./../../../assets/images/faces/face1.jpg")}
                      alt="profile"
                    />
                    <span className="online"></span>
                  </div>
                  <div className="info">
                    <p>Thomas Douglas</p>
                    <p>Available</p>
                  </div>
                  <small className="text-muted my-auto">19 min</small>
                </li>
                <li className="list">
                  <div className="profile">
                    <img
                      src={require("./../../../assets/images/faces/face2.jpg")}
                      alt="profile"
                    />
                    <span className="offline"></span>
                  </div>
                  <div className="info">
                    <div className="wrapper d-flex">
                      <p>Catherine</p>
                    </div>
                    <p>Away</p>
                  </div>
                  <div className="badge badge-success badge-pill my-auto mx-2">
                    4
                  </div>
                  <small className="text-muted my-auto">23 min</small>
                </li>
              </ul>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
