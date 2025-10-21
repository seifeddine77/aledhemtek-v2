package com.aledhemtek.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@DiscriminatorValue("CLIENT")
public class Client extends User {
    @OneToMany(mappedBy = "client")
    private List<Review> reviews;
}
