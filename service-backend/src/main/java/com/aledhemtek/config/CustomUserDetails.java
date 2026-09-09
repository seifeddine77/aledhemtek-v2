package com.aledhemtek.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.aledhemtek.model.User;
import com.aledhemtek.model.Consultant;
import com.aledhemtek.enums.AccountStatus;

import java.util.Collection;
import java.util.stream.Collectors;

public class CustomUserDetails implements UserDetails {
    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName())) // ✅ important
                .collect(Collectors.toList());
    }

    @Override public String getPassword() { return user.getPassword(); }
    @Override public String getUsername() { return user.getEmail(); }
    @Override public boolean isAccountNonExpired() { return user.isAccountNonExpired(); }
    @Override public boolean isAccountNonLocked() { return user.isAccountNonLocked(); }
    @Override public boolean isCredentialsNonExpired() { return user.isCredentialsNonExpired(); }
    @Override 
    public boolean isEnabled() { 
        if (!user.isEnabled()) {
            return false;
        }
        if (user instanceof Consultant) {
            return ((Consultant) user).getStatus() == AccountStatus.APPROVED;
        }
        return true; 
    }
}
