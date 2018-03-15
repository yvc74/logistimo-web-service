/*
 * Copyright © 2018 Logistimo.
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

package com.logistimo.returns.entity;

import com.logistimo.returns.entity.values.Batch;
import com.logistimo.returns.entity.values.ReturnsReceived;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * @author Mohan Raja
 */
@Entity
@Table(name = "RETURNS_ITEM_BATCH")
public class ReturnsItemBatch {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id")
  private Long id;

  @Column(name = "item_id")
  private Long itemId;

  @Embedded
  private Batch batch;

  @Column(name = "quantity")
  private BigDecimal quantity = BigDecimal.ZERO;

  @Column(name = "material_status")
  private String materialStatus;

  @Column(name = "reason")
  private String reason;

  @Embedded
  private ReturnsReceived received;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    if(this.id != null) {
      throw new IllegalStateException("Id can't be modified");
    }
    this.id = id;
  }

  public Long getItemId() {
    return itemId;
  }

  public void setItemId(Long itemId) {
    if(this.itemId != null) {
      throw new IllegalStateException("Item id can't be modified");
    }
    this.itemId = itemId;
  }

  public Batch getBatch() {
    return batch;
  }

  public void setBatch(Batch batch) {
    this.batch = batch;
  }

  public BigDecimal getQuantity() {
    return quantity;
  }

  public void setQuantity(BigDecimal quantity) {
    this.quantity = quantity;
  }

  public String getMaterialStatus() {
    return materialStatus;
  }

  public void setMaterialStatus(String status) {
    this.materialStatus = status;
  }

  public String getReason() {
    return reason;
  }

  public void setReason(String reason) {
    this.reason = reason;
  }

  public ReturnsReceived getReceived() {
    return received;
  }

  public void setReceived(ReturnsReceived received) {
    this.received = received;
  }
}