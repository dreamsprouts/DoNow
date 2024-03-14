import React from 'react';

const Header = ({ onLogin }) => {

  return (
    <header className="app-header">
      <h1>DoNow</h1>
      <nav>
        <button onClick={onLogin}>Login</button>
      </nav>
    </header>
  );
};

export default Header;
