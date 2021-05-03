import React, { Component } from "react";

import {
	Modal,
	FormTitle,
	Spinner,
	Flex,
	Text,
	Button,
	Tooltip,
} from "@vizality/components";
import { get } from "@vizality/http";
import { close } from "@vizality/modal";
import { getModule, getModuleByDisplayName } from "@vizality/webpack";

export default class DiscordRepModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			got: false,
			content: <Spinner />,
			footer: null,
		};
	}

	render() {
		const EmptyState = getModuleByDisplayName("EmptyState");

		const { theme } = getModule("locale", "theme");
		const { marginBottom20 } = getModule("marginBottom20");

		if (!this.state.got)
			get(`https://discordrep.com/api/v3/rep/${this.props.user.id}`, {
				Authorization:
					"D-REP.UDGIF65TXKMCAPQD3.ZH7BKAET9E70SJP0XZXCPKWQ.VPYD3XKCXNBZGT3",
			})
				.then((response) => {
					this.setState({ got: true });

					if (response.body.optout)
						return this.setState({
							content: (
								<EmptyState theme={theme}>
									<EmptyState.Image
										darkSrc="/assets/8c998f8fb62016fcfb4901e424ff378b.svg"
										lightSrc="/assets/645df33d735507f39c78ce0cac7437f0.svg"
										width={433 / 1.25}
										height={232 / 1.25}
									/>
									<EmptyState.Text
										className={marginBottom20}
										note="This user has opted out."
									/>
								</EmptyState>
							),
						});

					const { upvotes, downvotes } = response.body;

					const reputation = upvotes - downvotes;

					const multiplier = 360 / (upvotes + downvotes);
					const upvotesDegree = upvotes * multiplier;

					this.setState({
						content: (
							<Flex className={marginBottom20}>
								<Tooltip
									text={
										reputation == 0
											? "No votes"
											: reputation > 0
											? `+${reputation}`
											: reputation
									}
									position="left"
								>
									<div
										className="discordrep-piechart"
										style={{
											background:
												multiplier != Infinity
													? `conic-gradient(#3498db ${upvotesDegree}deg, #e74c3c 0 ${
															upvotesDegree + downvotes * multiplier
													  }deg)`
													: "var(--background-secondary)",
										}}
									/>
								</Tooltip>
								<div style={{ marginLeft: "20px" }}>
									<FormTitle>Key</FormTitle>
									<Text className="discordrep-key">
										<Flex>
											<div className="discordrep-colorKey discordrep-colorKey-upvote" />
											Upvotes - {upvotes}
										</Flex>
									</Text>
									<Text className="discordrep-key">
										<Flex>
											<div className="discordrep-colorKey discordrep-colorKey-downvote" />
											Downvotes - {downvotes}
										</Flex>
									</Text>
									<Text className="discordrep-key">
										<Flex>
											<div className="discordrep-colorKey discordrep-colorKey-novotes" />
											No votes
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
					});
				})
				.catch((response) => {
					this.setState({
						content: (
							<EmptyState theme={theme}>
								<EmptyState.Image
									darkSrc="/assets/e9baf4b505eb54129f832556ea16538e.svg"
									lightSrc="/assets/9c3d15a94528df326eb741af39b9f0a9.svg"
									width={254 / 1.25}
									height={154 / 1.25}
								/>
								<EmptyState.Text
									className={marginBottom20}
									note={`${response.statusCode}: ${response.statusText}`}
								/>
							</EmptyState>
						),
					});
				});

		return (
			<Modal>
				<Modal.Header size={Modal.Sizes.MEDIUM}>
					<FormTitle tag="h4">
						{this.props.user.username}'s DiscordRep Stats
					</FormTitle>
					<Modal.CloseButton onClick={() => close()} />
				</Modal.Header>
				<Modal.Content>{this.state.content}</Modal.Content>
				{this.state.footer}
			</Modal>
		);
	}
}
