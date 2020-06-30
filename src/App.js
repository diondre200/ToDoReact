import React from "react";
import "./App.css";
import { Collapse, Card, CardHeader } from "reactstrap";
import moment from "moment";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.toggle = this.toggle.bind(this);
		this.state = {
			taskDesc: "",
			taskAt: "",
			collapse: 0,
			todo: null,
			showCompletedtask: false,
			cards: [
				{
					title: "Today",
					alias: "today",
				},
				{
					title: "Tomorrow",
					alias: "tomorrow",
				},
				{
					title: "This week",
					alias: "thisWeek",
				},
				{
					title: "No Date",
					alias: "noDate",
				},
			],
			completedTask: [],
			todayTask: [],
			tomorrowTask: [],
			thisWeekTask: [],
			noDateTask: [],
		};
	}

	toggleCompletedTask = () => {
		this.setState({ showCompletedtask: !this.state.showCompletedtask });
	};

	markAsCompleted = (data) => {
		const currentTasks = localStorage.getItem("todo")
			? JSON.parse(localStorage.getItem("todo"))
			: [];

		const find = currentTasks.findIndex(
			(cards) => cards.createdAt === data.createdAt
		);
		if (find >= 0) {
			currentTasks[find].isCompleted = true;
		}

		localStorage.setItem("todo", JSON.stringify(currentTasks));
		this.seperateTask();
	};

	getCount = (title) => {
		let todayDate = moment()
			.set("hour", 23)
			.set("minute", 59)
			.set("second", 59);
		let taskDate;
		if (title === "today") {
			taskDate = todayDate.format("DDMMYYYYhhmmss");
		} else if (title === "tomorrow") {
			taskDate = todayDate.add(1, "days").format("DDMMYYYYhhmmss");
		} else if (title === "thisWeek") {
			taskDate = todayDate.clone().weekday(7).format("DDMMYYYYhhmmss");
		} else {
			taskDate = null;
		}

		const currentTasks = localStorage.getItem("todo")
			? JSON.parse(localStorage.getItem("todo"))
			: [];
		if (!taskDate) {
			let data = currentTasks.filter(
				(task) => !task.taskAt && !task.isCompleted
			).length;
			return data;
		} else {
			let data = currentTasks.filter(
				(task) => task.taskAt === taskDate && !task.isCompleted
			).length;
			// console.log("data is",data);
			return data;
		}
	};

	seperateTask = () => {
		const currentTasks = localStorage.getItem("todo")
			? JSON.parse(localStorage.getItem("todo"))
			: [];

		let completedTask = [];
		let todayTask = [];
		let tomorrowTask = [];
		let thisWeekTask = [];
		let noDateTask = [];

		const todayDateWithEndTime = moment()
			.set("hour", 23)
			.set("minute", 59)
			.set("second", 59);

		const today = todayDateWithEndTime.format("DDMMYYYYhhmmss");
		const tomorrow = todayDateWithEndTime
			.add(1, "days")
			.format("DDMMYYYYhhmmss");

		const weekStart = todayDateWithEndTime
			.clone()
			.weekday(1)
			.format("DDMMYYYYhhmmss");
		const weekEnd = todayDateWithEndTime
			.clone()
			.weekday(7)
			.format("DDMMYYYYhhmmss");

		if (currentTasks && currentTasks.length) {
			for (let i = 0; i < currentTasks.length; i++) {
				const singleTask = currentTasks[i];

				if (singleTask.isCompleted) {
					completedTask.push(singleTask);
				}
				if (!singleTask.taskAt) {
					noDateTask.push(singleTask);
				} else if (singleTask.taskAt === today) {
					todayTask.push(singleTask);
				} else if (singleTask.taskAt === tomorrow) {
					tomorrowTask.push(singleTask);
				} else if (
					singleTask.taskAt >= weekStart ||
					singleTask.taskAt <= weekEnd
				) {
					thisWeekTask.push(singleTask);
				}
			}

		}

		this.setState({
			completedTask,
			todayTask,
			tomorrowTask,
			thisWeekTask,
			noDateTask,
		});
	};

	componentDidMount() {
		this.seperateTask();
	}

	toggle = (index) => {
		this.setState({
			collapse: index,
		});
	};

	addNewTask = () => {
		let currentLocalStorage = localStorage.getItem("todo")
			? JSON.parse(localStorage.getItem("todo"))
			: [];

		if (!this.state.taskDesc || this.state.taskDesc.trim() === "") {
			alert("Please add some task description");
			return;
		} else {
			let todayDate = moment()
				.set("hour", 23)
				.set("minute", 59)
				.set("second", 59);
			let taskDate;
			if (this.state.taskAt === "today") {
				taskDate = todayDate.format("DDMMYYYYhhmmss");
			} else if (this.state.taskAt === "tomorrow") {
				taskDate = todayDate.add(1, "days").format("DDMMYYYYhhmmss");
			} else if (this.state.taskAt === "this week") {
				taskDate = todayDate
					.clone()
					.weekday(7)
					.format("DDMMYYYYhhmmss");
			}

			const newTaskObj = {
				task: this.state.taskDesc,
				createdAt: new Date(),
				taskAt: taskDate,
				isCompleted: false,
			};

			if (currentLocalStorage && currentLocalStorage.length) {
				currentLocalStorage.push(newTaskObj);
			} else {
				currentLocalStorage = [newTaskObj];
			}

			localStorage.setItem("todo", JSON.stringify(currentLocalStorage));
			this.seperateTask();
		}
	};

	removeTask = (task, index) => {
		this.state.completedTask.splice(index, 1);
		this.setState({ completedTask: [...this.state.completedTask] });
		let currentLocalStorage = localStorage.getItem("todo")
			? JSON.parse(localStorage.getItem("todo"))
			: [];
		const objIndex = currentLocalStorage.findIndex(_item => _item.createdAt == task.createdAt);

		if (objIndex > -1) {
			currentLocalStorage.splice(objIndex, 1);
			localStorage.setItem("todo", JSON.stringify(currentLocalStorage));
			this.seperateTask();
		}
	}

	render() {
		return (
			<div>
				<div className="app-logo d-flex justify-content-center">
					<img
						src={require("./assets/checked.png")}
						className="img"
					></img>
					<p className="title ml-2"> TodoApp </p>
				</div>
				<div className="container body">
					<div className="nav-container d-flex category">
						<div style={{ width: "55%" }}>
							<input
								className="search-field"
								placeholder="What do you need to get done?"
								value={this.state.taskDesc}
								onChange={(e) => {
									this.setState({
										taskDesc: e.target.value,
									});
								}}
							/>
						</div>
						<div className="align-self-center">
							<button
								className="btn btn-link"
								style={{
									backgroundColor:
										this.state.taskAt == "today"
											? "rgba(255, 0, 110, 0.1)"
											: "",
									color:
										this.state.taskAt == "today"
											? "#FF006E"
											: "",
									marginLeft: 15
								}}
								onClick={(e) => {
									this.setState({
										taskAt: "today",
									});
								}}
							>
								Today
							</button>
							<button
								className="btn btn-link"
								style={{
									backgroundColor:
										this.state.taskAt == "tomorrow"
											? "rgba(251, 86, 7, 0.08)"
											: "",
									color:
										this.state.taskAt == "tomorrow"
											? "#FB5607"
											: "",
									marginLeft: 15
								}}
								onClick={(e) => {
									this.setState({
										taskAt: "tomorrow",
									});
								}}
							>
								Tomorrow
							</button>
							<button
								className="btn btn-link"
								style={{
									backgroundColor:
										this.state.taskAt == "this week"
											? "rgba(255, 190, 11, 0.08)"
											: "",
									color:
										this.state.taskAt == "this week"
											? "#FFBE0B"
											: "", marginLeft: 15
								}}
								onClick={(e) => {
									this.setState({
										taskAt: "this week",
									});
								}}
							>
								This Week
							</button>
							<button
								className="btn btn-link"
								style={{
									backgroundColor:
										this.state.taskAt == "no date"
											? "#ccc"
											: "",
									color:
										this.state.taskAt == "no date"
											? "#000"
											: "", marginLeft: 15
								}}
								onClick={(e) => {
									this.setState({
										taskAt: "no date",
									});
								}}
							>
								No Date
							</button>
							<button
								className="btn btn-link"
								onClick={this.addNewTask}
								style={{
									backgroundColor:
										this.state.taskAt == "this week"
											? "#FFBE0B"
											: this.state.taskAt == "tomorrow"
												? "#FB5607"
												: this.state.taskAt == "today"
													? "#FF006E"
													: this.state.taskAt == "no date"
													? "#ccc":"",
									color: this.state.taskAt ? "#fff" : "", marginLeft: 15
								}}
							>
								<i
									className="fa fa-plus"
									aria-hidden="true"
								></i>
							</button>
						</div>
					</div>
					<div>
						{this.state.cards.map((cardData, index) => {
							return (
								<Card
									style={{ marginBottom: "1rem" }}
									className="container p-0"
									key={index}
								>
									<CardHeader
										onClick={() => {
											this.toggle(index);
										}}
										data-event={index}
									>
										{cardData.title === "Today" ? (
											<div
												key="key1"
												className="category row"
											>
												<div className="col-8">
													<i
														className="fa fa-hdd-o"
														aria-hidden="true"
														style={{
															color: "#FF006E",
														}}
													></i>
													<span
														className="category-label"
														style={{
															color: "#FF006E",
														}}
													>
														Today
													</span>
												</div>
												<div className="col-4 ">
													<p className="pull-right count">
														{this.getCount(
															cardData.alias
														)}{" "}
														todos
													</p>
												</div>
											</div>
										) : (
												""
											)}

										{cardData.title === "Tomorrow" ? (
											<div
												key="key1"
												className="category row"
											>
												<div className="col-8">
													<i
														className="fa fa-sun-o"
														aria-hidden="true"
														style={{
															color: "#FB5607",
														}}
													></i>
													<span
														className="category-label"
														style={{
															color: "#FB5607",
														}}
													>
														Tomorrow
													</span>
												</div>

												<div className="col-4 ">
													<p className="pull-right count">
														{this.getCount(
															cardData.alias
														)}
														{"  "}
														todos
													</p>
												</div>
											</div>
										) : (
												""
											)}

										{cardData.title === "This week" ? (
											<div
												key="key3"
												className="category row"
											>
												<div className="col-8">
													<i
														className="fa fa-calendar-o"
														aria-hidden="true"
														style={{
															color: "#FFBE0B",
														}}
													></i>
													<span
														className="category-label"
														style={{
															color: "#FFBE0B",
														}}
													>
														This week
													</span>
												</div>

												<div className="col-4">
													<p className="pull-right count">
														{this.getCount(
															cardData.alias
														)}
														{"  "}
														todos
													</p>
												</div>
											</div>
										) : (
												""
											)}

										{cardData.title === "No Date" ? (
											<div
												key="key4"
												className="category row"
											>
												<div className="col-8">
													<i
														className="fa fa-folder-o"
														aria-hidden="true"
														style={{
															color: "#9D9FA7",
														}}
													></i>
													<span
														className="category-label"
														style={{
															color: "#9D9FA7",
														}}
													>
														No date
													</span>
												</div>

												<div className="col-4">
													<p className="pull-right count">
														{this.getCount(
															cardData.alias
														)}
														{"  "}
														todos
													</p>
												</div>
											</div>
										) : (
												""
											)}
									</CardHeader>
									<Collapse
										isOpen={this.state.collapse === index}
									>
										<div className="container">
											<div className="row">
												{this.state[
													cardData.alias + "Task"
												].map((data) => (
													<>
														{data.isCompleted ? (
															<>
																<div className="col-9 ">
																	<label className="count pl-2 mt-2">
																		<i
																			class="fa fa-check-circle tick pr-1"
																			style={{ color: "#03CEA4" }}
																			aria-hidden="true"
																		></i>
																		{"  "}
																		{
																			data.task
																		}{" "}
																	</label>
																</div>

																<div className="col-3 mt-2">
																	<p className="pull-right count mt-1" style={{ color: "#03CEA4" }}>
																		COMPLETED
																	</p>
																</div>
															</>
														) : (
																<>
																	<div class="form-check col-9 ">
																		<label class="form-check-label pl-4 mt-2">
																			<input
																				type="radio"
																				class="form-check-input"
																				name="optradio"
																				name={
																					data.createdAt
																				}
																				value={
																					data.createdAt
																				}
																				onChange={(
																					e
																				) => {
																					this.setState(
																						{
																							todo:
																								e
																									.target
																									.value,
																						}
																					);
																					e.preventDefault();
																				}}
																				checked={
																					data.createdAt ===
																					this
																						.state
																						.todo
																				}
																			/>
																			<p className="count">
																				{
																					data.task
																				}
																			</p>
																		</label>
																	</div>

																	<div className="col-3 mt-2 mb-1">
																		<button
																			class="btn btn-round icon pull-right"
																			onClick={() =>
																				this.markAsCompleted(
																					data
																				)
																			}
																		>
																			<i class="fa  fa-check"></i>
																		</button>
																	</div>
																</>
															)}
													</>
												))}
											</div>
										</div>
									</Collapse>
								</Card>
							);
						})}

						{this.state.completedTask.length ? (
							<>
								<div className="text-center">
									<span
										class="label label-success btn text-center count"
										onClick={this.toggleCompletedTask}
									>
										{this.state.showCompletedtask
											? "Hide"
											: "Show"}{" "}
										{this.state.completedTask.length}{" "}
										Completed Task
									</span>
								</div>

								{this.state.showCompletedtask
									? this.state.completedTask.map(
										(compltedTask, i) => (
											<div
												class="alert alert-light alert-dismissible fade show"
												role="alert"
											>
												{compltedTask.task}
												<button
													type="button"
													class="close"
													data-dismiss="alert"
													aria-label="Close"
													onClick={() => { this.removeTask(compltedTask, i) }}

												>
													<span aria-hidden="true">
														&times;
														</span>
												</button>
											</div>
										)
									)
									: null}
							</>
						) : (
								<p className="text-center count">
									No completed Task{" "}
								</p>
							)}
					</div>
				</div>
			</div>
		);
	}
}

export default App;
