/* eslint-disable multiline-comment-style */
/*
 ! So the discordrep.com devs got mad at me for letting you guys see the API key but uh,
 ! I can't really hide it so just... don't use it?
 ! You can get your own by joining their server and typing "-api gen", it's really easy :T
 */

import React, { Component } from 'react';

import {
  Modal,
  FormTitle,
  Spinner,
  Flex,
  Text,
  Button,
  Tooltip
} from '@vizality/components';
import { get } from '@vizality/http';
import { close } from '@vizality/modal';
import { getModule, getModuleByDisplayName } from '@vizality/webpack';

const { Slides, Slide } = getModule('Slides');
const EmptyState = getModuleByDisplayName('EmptyState');
const { marginBottom20, marginBottom40 } = getModule('marginBottom20');

export default class DiscordRepModal extends Component {
  constructor (props) {
    super(props);

    this.state = {
      slide: 'loading',
      header: null,
      content: null,
      footer: null,
      errorImage: null,
      errorText: null
    };
  }

  render () {
    const { theme } = getModule('locale', 'theme');

    return (
      <Modal size="">
        <Slides
          activeSlide={this.state.slide}
          onSlideReady={(e) => {
            return this.setState({ slide: e });
          }}
          width={440}
        >
          <Slide
            id="loading"
            impressionName="impression_discordrep_landing"
            impressionMetadata={{ impression_group: 'discordrep_flow' }}
          >
            <Modal.Header separator={false}>
              <FormTitle tag="h4">Loading...</FormTitle>
              <Modal.CloseButton onClick={() => close()} />
            </Modal.Header>
            <Modal.Content>
              <Spinner className={marginBottom40} />
            </Modal.Content>
          </Slide>

          <Slide
            id="error"
            impressionName="impression_discordrep_error"
            impressionMetadata={{ impression_group: 'discordrep_flow' }}
          >
            <Modal.Header separator={false}>
              <FormTitle tag="h4">{this.state.header}</FormTitle>
              <Modal.CloseButton onClick={() => close()} />
            </Modal.Header>
            <Modal.Content>
              <EmptyState className={marginBottom20} theme={theme}>
                {this.state.errorImage}
                <EmptyState.Text note={this.state.errorText} />
              </EmptyState>
            </Modal.Content>
          </Slide>

          <Slide
            id="content"
            impressionName="impression_discordrep_content"
            impressionMetadata={{ impression_group: 'discordrep_flow' }}
          >
            <Modal.Header separator={false}>
              <FormTitle tag="h4">{this.state.header}</FormTitle>
              <Modal.CloseButton onClick={() => close()} />
            </Modal.Header>
            <Modal.Content>{this.state.content}</Modal.Content>
            {this.state.footer}
          </Slide>
        </Slides>
      </Modal>
    );
  }

  componentDidMount () {
    get(`https://discordrep.com/api/v3/rep/${this.props.user.id}`, {
      Authorization: 'D-REP.4ZMGK41BR427SNQMSPEO9VI24PWEKP9CYSOUTVRM87M61QOXNW5CPCGFIC'
    })
      .then((response) => {
        if (response.body.optout) {
          return this.setState({
            header: 'User Opted Out',
            errorImage: (
              <EmptyState.Image
                darkSrc="/assets/8c998f8fb62016fcfb4901e424ff378b.svg"
                lightSrc="/assets/645df33d735507f39c78ce0cac7437f0.svg"
                width={433 / 1.25}
                height={232 / 1.25}
              />
            ),
            errorText: (
              <>
                {'This user has opted out.'}
                <br />
                {'It\'s sad but true, try someone else maybe?'}
              </>
            ),
            slide: 'error'
          });
        }

        const { upvotes, downvotes } = response.body;

        const reputation = upvotes - downvotes;

        const multiplier = 360 / (upvotes + downvotes);
        const upvotesDegree = upvotes * multiplier;

        this.setState({
          header: `${this.props.user.username}'s DiscordRep Stats`,
          content: (
            <Flex className={marginBottom20}>
              <Tooltip
                text={
                  upvotes + downvotes === 0
                    ? 'No votes'
                    : reputation >= 0
                      ? `+${reputation}`
                      : reputation
                }
                position="left"
                hideOnClick={false}
              >
                <div
                  className="discordrep-piechart"
                  style={{
                    background: multiplier !== Infinity
                      ? `conic-gradient(#3498db ${upvotesDegree}deg, #e74c3c 0 ${
                        upvotesDegree + downvotes * multiplier
                      }deg)`
                      : 'var(--background-secondary)'
                  }}
                />
              </Tooltip>
              <div style={{ marginLeft: '20px' }}>
                <FormTitle>Key</FormTitle>
                <Text className="discordrep-key">
                  <Flex>
                    <div className="discordrep-colorKey discordrep-colorKey-upvote" />
                    {`Upvotes - ${upvotes}`}
                  </Flex>
                </Text>
                <Text className="discordrep-key">
                  <Flex>
                    <div className="discordrep-colorKey discordrep-colorKey-downvote" />
                    {`Downvotes - ${downvotes}`}
                  </Flex>
                </Text>
                <Text className="discordrep-key">
                  <Flex>
                    <div className="discordrep-colorKey discordrep-colorKey-novotes" />
                    {'No votes'}
                  </Flex>
                </Text>
              </div>
            </Flex>
          ),
          footer: (
            <Modal.Footer>
              <a
                href={`https://discordrep.com/u/${response.body.id}`}
                target="_blank"
              >
                <Button>Vote at DiscordRep.com</Button>
              </a>
            </Modal.Footer>
          ),
          slide: 'content'
        });
      })
      .catch((response) => {
        this.setState({
          header: 'Request Error',
          errorImage: (
            <EmptyState.Image
              darkSrc="/assets/e9baf4b505eb54129f832556ea16538e.svg"
              lightSrc="/assets/9c3d15a94528df326eb741af39b9f0a9.svg"
              width={254 / 1.25}
              height={154 / 1.25}
            />
          ),
          errorText: (
            <>
              {'Looks like our friends over at'}
              <br />
              {'discordrep.com are having some issues!'}
              <br />
              <br />
              {'Here\'s what they have to say:'}
              <br />
              {response.statusCode} - {response.statusText}
            </>
          ),
          slide: 'error'
        });
      });

    setTimeout(() => {
      if (this.state.slide === 'loading') {
        this.setState({
          header: 'Request Timeout',
          errorImage: (
            <EmptyState.Image
              darkSrc="/assets/87ad02315e38924402c7fb5017cf11ab.svg"
              lightSrc="/assets/38af48da1542dfedce582fc5e8042285.svg"
              width={240}
              height={130}
            />
          ),
          errorText: (
            <>
              {'Hello? Anybody home?'}
              <br />
              {'It seems discordrep.com isn\'t responding, try again later.'}
            </>
          ),
          slide: 'error'
        });
      }
    }, 10000);
  }
}
