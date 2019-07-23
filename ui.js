'use strict';
const React = require('react');
const {Color, Box, StdinContext} = require('ink');

const list = '(){}<>[]_-+=\'"!@#$%^&*\\|,./?;:`~'.split('');

const getKey = () => {
	return list[Math.floor(Math.random() * list.length)];
};

const Context = () => {
	return (
		<StdinContext.Consumer>
			{({stdin, setRawMode}) => (
				<App stdin={stdin} setRawMode={setRawMode}/>
			)}
		</StdinContext.Consumer>
	);
};

const App = props => {
	const [progress, setProgress] = React.useState([{key: getKey(), result: 0}]);

	const handleInput = React.useCallback(data => {
		const newProgress = progress.slice();
		const last = {
			...newProgress[newProgress.length - 1]
		};

		last.result = last.key === data ? 1 : -1;

		newProgress[newProgress.length - 1] = last;

		setProgress([...newProgress, {key: getKey(), result: 0}]);
	}, [progress, setProgress]);

	React.useEffect(() => {
		props.setRawMode(true);
		props.stdin.on('data', handleInput);

		return () => {
			props.setRawMode(false);
			props.stdin.off('data', handleInput);
		};
	}, [props.stdin, props.setRawMode, handleInput, props]);

	const total = React.useMemo(() => {
		return progress.reduce((sum, p) => {
			return sum + (p.result !== 0 ? 1 : 0);
		}, 0);
	}, [progress]);

	const correct = React.useMemo(() => {
		return progress.reduce((sum, p) => {
			return sum + (p.result === 1 ? 1 : 0);
		}, 0);
	}, [progress]);

	return (
		<Box height={3} flexDirection="column">
			<Box>
				{progress.map((p, index) => (
					<Color key={index} green={p.result === 1} red={p.result === -1}>
						{p.key}
					</Color>
				))}
			</Box>
			{total !== 0 ? (
				<Box>
					{correct / total * 100}%
				</Box>
			) : null}
			<Box>
				{correct}/{total}
			</Box>
		</Box>
	);
};

module.exports = Context;
