import React from "react";

type Props = {
	label: string;
	isToggled: boolean;
	// eslint-disable-next-line no-unused-vars
	setIsToggled: (isToggled: boolean) => void;
};

const ToggleSwitch = ({ label, isToggled, setIsToggled }: Props) => {
	const toggle = () => setIsToggled(!isToggled);

	return (
		<div className="slk-connect__toggle_switch__container">
			<label className="slk-connect__toggle_switch">
				<input
					type="checkbox"
					className="slk-connect__toggle_switch__checkbox"
					checked={isToggled}
					onChange={toggle}
				/>
				<span
					className={`slk-connect__toggle_switch__toggle-background ${isToggled ? "slk-connect__toggle_switch__toggle-background--toggled" : "slk-connect__toggle_switch__toggle-background--untoggled"}`}
				/>
				<span
					className={`slk-connect__toggle_switch__switch ${isToggled ? "slk-connect__toggle_switch__switch--toggled" : "slk-connect__toggle_switch__switch--untoggled"}`}
				/>
			</label>
			<div className="slk-connect__toggle_switch__text">{label}</div>
		</div>
	);
};

export default ToggleSwitch;
