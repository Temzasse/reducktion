import * as React from 'react';
import styled from 'styled-components';
import { FetchableValue } from 'reducktion';
import { Profile as ProfileType } from './user.types';

interface Props {
  profile: FetchableValue<ProfileType | null>;
}

class Profile extends React.Component<Props> {
  render() {
    const { profile } = this.props;

    if (!profile.data) return null;

    return (
      <Container>
        <Avatar url={profile.data.avatarUrl} />
        <Details>
          <Name>{profile.data.name}</Name>
          <Github href={profile.data.githubUrl}>{profile.data.githubUrl}</Github>
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
  background-image: url(${(props: { url: string }) => props.url});
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
