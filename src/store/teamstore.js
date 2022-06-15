// Vue
import Vue from 'vue'
import Vuex from 'vuex'
import pathify from '@/plugins/vuex-pathify'
import {
	vuexfireMutations,
	firestoreAction
} from 'vuexfire'
import {
	db
} from '../db.js'

// Modules
import * as modules from './modules/teamstore.js'

Vue.use(Vuex)

export default function makeTeamStore () {
	const teamStore = new Vuex.Store({
		modules,
		plugins: [
			pathify.plugin
		],
		mutations: {
			// Root level mutations needed for vuexfire
			...vuexfireMutations
		},
		actions: {
			// Progress Bind and Unbind
			bindProgress: firestoreAction(({
				bindFirestoreRef
			}, userId) => {
				return bindFirestoreRef('progress', db.collection('progress').doc(userId))
			}),
			unbindProgress: firestoreAction(({
				unbindFirestoreRef
			}) => {
				unbindFirestoreRef('progress')
			})
		}
	})
	return teamStore
}

export const ROOT_DISPATCH = Object.freeze({
	root: false
})
