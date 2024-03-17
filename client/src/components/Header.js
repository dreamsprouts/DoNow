import React from 'react';

const Header = ({ onLogin , onLogout, isLoggedIn  }) => {

  return (
    <header className="app-header">
      <h1>DoNow</h1>
      <nav>
        {/* 根據 isLoggedIn 的值切換按鈕 */}
        {isLoggedIn ? (
          <button onClick={onLogout}>Logout</button>
        ) : (
          <button onClick={onLogin}>Login</button>
        )}
      </nav>
    </header>
  );
};

export default Header;
