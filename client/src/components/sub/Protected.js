import React from "react";
import { Outlet, Navigate } from "react-router-dom";

const Protected = () => {
  const user = null;
  return user ? <Outlet></Outlet> :<Navigate to ="/userAirdropData"/>
};

export default Protected;
