package com.splitrackr.backend.household.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.splitrackr.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(
        name = "household",
        uniqueConstraints = {
                @UniqueConstraint(name = "uc_household_invite_code", columnNames = "invite_code")
        }

)
public class Household {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="household_id", nullable = false)
    @JsonIgnore
    private Integer householdId;

    @Column(name="household_name", nullable=false)
    private String householdName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="owner_id", nullable=false)
    @JsonIgnore
    private User owner;

    @Column(name="invite_code", nullable=false, length=8, unique=true)
    private String inviteCode;

    @Column(name = "created_date", nullable=false, updatable=false)
    private Instant createdDate;

    // create date and invite code if not existed already
    @PrePersist
    void onCreate() {
        if(createdDate == null) createdDate = Instant.now();
        if(inviteCode != null) inviteCode = inviteCode.toUpperCase();
    }
}
