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

package com.logistimo.orders.approvals.models;

import com.google.gson.annotations.SerializedName;

import com.logistimo.users.models.UserContactModel;

import java.util.Date;

/**
 * Created by naveensnair on 22/06/17.
 */
public class ApproverModel extends UserContactModel {

  @SerializedName("approver_type")
  private String approverType;

  @SerializedName("approver_status")
  private String approverStatus;

  @SerializedName("expires_at")
  private Date expiresAt;

  @SerializedName("starts_at")
  private Date startsAt;

  public String getApproverType() {
    return approverType;
  }

  public void setApproverType(String approverType) {
    this.approverType = approverType;
  }

  public String getApproverStatus() {
    return approverStatus;
  }

  public void setApproverStatus(String approverStatus) {
    this.approverStatus = approverStatus;
  }

  public Date getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(Date expiresAt) {
    this.expiresAt = expiresAt;
  }

  public Date getStartsAt() {
    return startsAt;
  }

  public void setStartsAt(Date startsAt) {
    this.startsAt = startsAt;
  }

}
