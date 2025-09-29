package com.splitrackr.backend.household.service;

import com.splitrackr.backend.household.dto.*;
import com.splitrackr.backend.household.model.Household;
import com.splitrackr.backend.household.model.MembershipRole;
import com.splitrackr.backend.household.model.HouseholdMembership;
import com.splitrackr.backend.household.repository.HouseholdMembershipRepository;
import com.splitrackr.backend.household.repository.HouseholdRepository;
import com.splitrackr.backend.user.User;
import com.splitrackr.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HouseholdService {

    private final HouseholdRepository householdRepository;

    private final HouseholdMembershipRepository householdMembershipRepository;

    private final UserRepository userRepository;

    // create a household
    @Transactional
    public HouseholdResponse createHousehold(CreateHouseholdRequest request) {
        // get and authenticate owner of household
        var owner = getAuthenticatedUser();

        // generate invite code
        String code;
        code = generate(8);

        // create household
        var household = Household.builder()
                .householdName(request.getHouseHoldName())
                .owner(owner)
                .inviteCode(code)
                .build();
        householdRepository.save(household);

        // assign household membership to owner
        var membership = HouseholdMembership.builder()
                .user(owner)
                .household(household)
                .role(MembershipRole.OWNER)
                .build();
        householdMembershipRepository.save(membership);

        // update user householdId
        owner.setUserHouseholdId(household.getHouseholdId());
        userRepository.save(owner);

        // return response for post request
        return HouseholdResponse.builder()
                .id(household.getHouseholdId())
                .name(household.getHouseholdName())
                .inviteCode(code)
                .build();
    }

    // join a household through invite code
    @Transactional
    public HouseholdResponse joinHousehold(JoinHouseholdRequest request) {
        var user = getAuthenticatedUser();
        // lookup household through invite code
        var household = householdRepository.findByInviteCode(request.getInviteCode()).orElseThrow();

        boolean checkMembership = householdMembershipRepository.existsByUser_IdAndHousehold_HouseholdId(user.getId(), household.getHouseholdId());

        // if user isn't member of this household already
        if(!checkMembership) {
            householdMembershipRepository.save(HouseholdMembership.builder()
                    .user(user)
                    .household(household)
                    .role(MembershipRole.MEMBER)
                    .build());
        }

        // update user householdId
        user.setUserHouseholdId(household.getHouseholdId());
        userRepository.save(user);

        // return response for post request
        return HouseholdResponse.builder()
                .id(household.getHouseholdId())
                .name(household.getHouseholdName())
                .inviteCode(household.getInviteCode())
                .build();
    }

    // List all user households
    @Transactional
    public List<HouseholdResponse> myHouseholds() {
        var user = getAuthenticatedUser();

        List<HouseholdMembership> myMemberships = householdMembershipRepository.findAllByUser_Id(user.getId());

        // turn list of household memberships into list of houses for response
        return myMemberships.stream()
                .map(HouseholdMembership::getHousehold)
                .map(h -> HouseholdResponse.builder()
                        .id(h.getHouseholdId())
                        .name(h.getHouseholdName())
                        .inviteCode(h.getInviteCode())
                        .build())
                .toList();
    }

    @Transactional
    public HouseholdResponse switchHousehold(SwitchHouseholdRequest request) {
        Integer reqId = request.getHouseholdId();

        var user = getAuthenticatedUser();

        // check if household exists
        Household hh = householdRepository.findById(reqId).orElseThrow();

        // is user a member of household
        boolean isMember = householdMembershipRepository.
                existsByUser_IdAndHousehold_HouseholdId(
                user.getId(), hh.getHouseholdId());
        // if not a member throw an error
        if(!isMember) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not a member of this household");
        }
        // check if user already has requested household set as active
        if(!reqId.equals(user.getUserHouseholdId())) {
            user.setUserHouseholdId(reqId);
            userRepository.save(user);
        }

        user.setUserHouseholdId(request.getHouseholdId());
        return HouseholdResponse.builder()
                .id(hh.getHouseholdId())
                .name(hh.getHouseholdName())
                .inviteCode(hh.getInviteCode())
                .build();
    }

    @Transactional
    public Optional<HouseholdResponse> activeHousehold() {
        var user = getAuthenticatedUser();

        // current user's active household id (make sure it exists or return empty body)
        Integer actId = user.getUserHouseholdId();
        if(actId == null) {return Optional.empty();}

        // get user household
        Household hh = householdRepository.findById(actId).
                orElseThrow(() -> new IllegalStateException("No current active household found"));

        return Optional.of(HouseholdResponse.builder()
                .id(hh.getHouseholdId())
                .name(hh.getHouseholdName())
                .inviteCode(hh.getInviteCode())
                .build());
    }

    @Transactional
    public List<HouseholdMemberResponse> houseUsers(Integer houseId) {
        var user = getAuthenticatedUser();

        var members = householdMembershipRepository.findAllByHousehold_HouseholdId(houseId);
        return members.stream()
                .map(m-> HouseholdMemberResponse.builder()
                        .id(m.getUser().getId())
                        .firstName(m.getUser().getFirstname())
                        .lastName(m.getUser().getLastname())
                        .email(m.getUser().getEmail())
                        .role(m.getRole())
                        .joinedDate(m.getJoinedDate())
                        .build())
                .toList();
    }

    // helper func to generate invite code
    public String generate(int len) {
        String s = java.util.UUID.randomUUID().toString().replace("-", "").toUpperCase();
        if(len > s.length()) {throw new IllegalArgumentException("length > 32");}
        return s.substring(0, len);
    }


    private User getAuthenticatedUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
