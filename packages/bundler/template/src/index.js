import React from 'react';
import ReactDOM from 'react-dom';

import './index.less';

class App extends React.Component {
  state = {
    name: 'hello curiosity'
  }

  render() {
    const { name } = this.state;
    return (
      <div className="name">{name}</div>
    )
  }
}


ReactDOM.render(<App />, document.getElementById('root'))
