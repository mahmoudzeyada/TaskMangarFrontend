import { Module, GetterTree, MutationTree, ActionTree } from "vuex";

import { ITasksState } from "@/types";
import ITask from "@/models/Task";
import authAxios from "@/AuthAxios";
import { AxiosResponse } from "axios";

const state: ITasksState = {
  tasks: []
};

const getters: GetterTree<ITasksState, any> = {
  getTasks: state => state.tasks
};

const mutations: MutationTree<ITasksState> = {
  ADD_TASK(state, task: ITask): void {
    state.tasks.push(task);
  },
  DELETE_TASK(state, taskId: string): void {
    const selectedTask = state.tasks.findIndex(task => task._id == taskId);
    if (selectedTask !== -1) {
      state.tasks.splice(selectedTask, 1);
    }
  },
  MODIFY_TASK(state, task: ITask): void {
    const selectedTask = state.tasks.findIndex(item => item._id == task._id);
    if (selectedTask !== -1) {
      state.tasks[selectedTask] = task;
    }
  },
  FETCH_TASKS(state, tasks: ITask[]) {
    state.tasks = tasks;
  }
};

const actions: ActionTree<ITasksState, any> = {
  async fetchTasks({ commit }) {
    try {
      const res: AxiosResponse<ITask[]> = await authAxios.get("/tasks");
      commit("FETCH_TASKS", res.data);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err.response.data);
    }
  },
  async createTask({ commit }, task: ITask) {
    try {
      const res: AxiosResponse<ITask> = await authAxios.post("tasks", task);
      commit("ADD_TASK", res.data);
      return Promise.resolve(res.data);
    } catch (err) {
      return Promise.reject(err.response.data);
    }
  },
  async addImageTask(
    { commit },
    payload: { taskId: number; image: HTMLInputElement }
  ) {
    try {
      const formBody = new FormData();
      formBody.append("image", (payload.image.files as FileList)[0]);
      const res: AxiosResponse<ITask> = await authAxios({
        method: "post",
        url: `tasks/${payload.taskId}/avatar`,
        data: formBody,
        headers: { "Content-type": "multipart/form-data" }
      });
      commit("MODIFY_TASK", res.data);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err.response.data);
    }
  }
};

const namespaced = true;

const Tasks: Module<ITasksState, any> = {
  namespaced,
  state,
  getters,
  mutations,
  actions
};

export default Tasks;
