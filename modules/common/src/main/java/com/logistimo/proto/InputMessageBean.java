/*
 * Copyright © 2017 Logistimo.
 *
 * This file is part of Logistimo.
 *
 * Logistimo software is a mobile & web platform for supply chain management and remote temperature monitoring in
 * low-resource settings, made available under the terms of the GNU Affero General Public License (AGPL).
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.  If not, see
 * <http://www.gnu.org/licenses/>.
 *
 * You can be released from the requirements of the license by purchasing a commercial license. To know more about
 * the commercial license, please contact us at opensource@logistimo.com
 */

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package com.logistimo.proto;

import java.util.Vector;

/**
 * Holds partial response message numbers that did not arrive at the client
 *
 * @author Arun
 */
public abstract class InputMessageBean implements MessageBean {

  protected String responseMsgNos = null;
  protected String msgId = null;
  protected String userId = null;
  protected String password = null;
  protected String version = MessageHeader.VERSION02;
  protected boolean isDev = false;

  public InputMessageBean() {
  }

  ;

  public InputMessageBean(String userId, String password, String version) {
    this.userId = userId;
    this.password = password;
    if (version != null && version.length() > 0) {
      this.version = version;
    }
  }

  // Get an instance, given input messages
  public static InputMessageBean getInstance(Vector messages) throws ProtocolException {
    if (messages == null || messages.isEmpty()) {
      throw new ProtocolException("No message specified");
    }
    MessageHeader hd = new MessageHeader((String) messages.elementAt(0));
    String cmd = hd.getCommand();
    if (cmd == null || cmd.length() == 0) {
      throw new ProtocolException("No command specified in message");
    }
    InputMessageBean iBean = null;
    if (RestConstantsZ.ACTION_LOGIN.equals(cmd)) {
      iBean = new AuthenticateInput();
    } else if (RestConstantsZ.ACTION_GETINVENTORY.equals(cmd)) {
      iBean = new GetInventoryInput();
    } else if (RestConstantsZ.ACTION_UPDINVENTORY.equals(cmd)) {
      iBean = new UpdateInventoryInput();
    } else if (RestConstantsZ.ACTION_GETORDERS.equals(cmd)) {
      iBean = new GetOrdersInput();
    } else if (RestConstantsZ.ACTION_GETORDER.equals(cmd)) {
      iBean = new GetOrderInput();
    } else if (RestConstantsZ.ACTION_UPDATEORDER.equals(cmd)) {
      iBean = new UpdateOrderInput();
    } else if (RestConstantsZ.ACTION_CANCELORDER.equals(cmd)) {
      iBean = new CancelOrderInput();
    } else if (RestConstantsZ.ACTION_UPDATEORDERSTATUS.equals(cmd)) {
      iBean = new UpdateOrderStatusInput();
    }
    // Load input bean, if present
    if (iBean == null) {
      throw new ProtocolException("Invalid command: " + cmd);
    }
    iBean.fromMessageString(messages);
    return iBean;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(final String userId) {
    this.userId = userId;
  }

  public String getPassword() {
    return password;
  }

  public boolean isDev() {
    return isDev;
  }

  public void setDev(boolean isDev) {
    this.isDev = isDev;
  }

  public String getVersion() {
    return version;
  }

  public String getResponseMessageNumbers() {
    return responseMsgNos;
  }

  public void setResponseMessageNumbers(String responseMsgNosCSV) {
    this.responseMsgNos = responseMsgNosCSV;
  }

  public boolean hasResponseMessageNumbers() {
    return responseMsgNos != null && responseMsgNos.length() > 0;
  }

  public String getMessageId() {
    return msgId;
  }

  public void setMessageId(String msgId) {
    this.msgId = msgId;
  }

  // NOTE: These methods have to be defined abstract, else we get a NoSuchMethod error in some S40 phones (e.g. S40 5th edition, feature pack 1)
  // Ref: http://discussion.forum.nokia.com/forum/showthread.php?154818-java-lang-NoSuchMethodError-on-Series-40
  public abstract Vector toMessageString() throws ProtocolException;

  public abstract void fromMessageString(Vector messages) throws ProtocolException;
}
