package com.splitrackr.backend.household.dto;


import com.splitrackr.backend.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHouseholdRequest {
    private String houseHoldName;
}
