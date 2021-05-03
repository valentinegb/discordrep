import React from "react";
import { Plugin } from "@vizality/entities";

import { patch, unpatchAll } from "@vizality/patcher";
import { ContextMenu } from "@vizality/components";
import { getModule } from "@vizality/webpack";
import { open } from "@vizality/modal";

import DiscordRepModal from "./components/DiscordRepModal";

const ContextMenuItem = (args) => (
	<ContextMenu.Item
		id="discordrep"
		label="View DiscordRep Stats"
		action={() => {
			open(() => <DiscordRepModal user={args[0].user} />);
		}}
	/>
);

export default class DiscordRep extends Plugin {
	start() {
		this.injectStyles("./style.css");

		patch(
			getModule((m) => m.default?.displayName === "DMUserContextMenu"),
			"default",
			(args, res) => {
				res.props.children.props.children.push(ContextMenuItem(args));

				return res;
			}
		);

		patch(
			getModule(
				(m) => m.default?.displayName === "GuildChannelUserContextMenu"
			),
			"default",
			(args, res) => {
				res.props.children.props.children.push(ContextMenuItem(args));

				return res;
			}
		);
	}

	stop() {
		unpatchAll("discordrep");
	}
}
