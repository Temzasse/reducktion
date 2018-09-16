import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

class Profile extends Component {
  static propTypes = {
    profile: PropTypes.shape({
      avatarUrl: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      githubUrl: PropTypes.string.isRequired,
    }),
  };

  state = {};

  render() {
    const { profile } = this.props;
    return (
      <Container>
        <Avatar url={profile.avatarUrl} />
        <Details>
          <Name>{profile.name}</Name>
          <Github href={profile.githubUrl}>{profile.githubUrl}</Github>
        </Details>
      </Container>
    );
  }
}

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-image: url(${props => props.url});
  margin-right: 16px;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Github = styled.a`
  color: slategray;
`;

export default Profile;
