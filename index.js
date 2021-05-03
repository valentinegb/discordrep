import React from "react";
import { Plugin } from "@vizality/entities";

import { patch } from "@vizality/patcher";
import { ContextMenu } from "@vizality/components";
import { getModule } from "@vizality/webpack";
import { open } from "@vizality/modal";

import DiscordRepModal from "./components/DiscordRepModal";

let unpatchDMUserContextMenu = () => {
	console.log("discordrep-dmusercontextmenu", "Not patched");
};
let unpatchGuildChannelUserContextMenu = () => {
	console.log("discordrep-guildchannelusercontextmenu", "Not patched");
};

const unpatch = () => {
	unpatchDMUserContextMenu();
	unpatchGuildChannelUserContextMenu();
};

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

		unpatchDMUserContextMenu = patch(
			"discordrep-dmusercontextmenu",
			getModule((m) => m.default?.displayName === "DMUserContextMenu"),
			"default",
			(args, res) => {
				res.props.children.props.children.push(ContextMenuItem(args));

				return res;
			}
		);

		unpatchGuildChannelUserContextMenu = patch(
			"discordrep-guildchannelusercontextmenu",
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
		unpatch();
	}
}
