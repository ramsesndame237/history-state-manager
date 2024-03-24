import {test,expect} from 'bun:test'
import {record2State, state2Record} from "../src/helpers/transform.ts";

test('should accurately transform between state and record representations',() =>{
    const state = {
        id:1,
        name:'intialstate',
        children:[
            {
                id:2,name:'ramses',children:[],
            },
            {
                id:3,name:'victor',children:[],
            },
            {

                id:4,name:'childtest',children:[
                    {
                        id:41,name:'deserve',children:[],
                    },
                    {
                        id:42,name:'victor 42',children:[],
                    }
                ],
            }
        ]
    }
    const chunks = {}
    const record = state2Record(state,chunks)
    const resultState = record2State(record,chunks)
    expect(resultState).toEqual(state)
})

test('should correctly handle invalid children data during transformation',()=>{
    const state = {
        id:1,
        name:'intialstate',
        children:[
            {
                id:2,name:'ramses',children:[],
            },
            {
                id:3,name:'victor',children:[],
            },
            {

                id:4,name:'childtest'
            }
        ]
    }
    const chunks = {}
    const record = state2Record(state,chunks)
    const resultState = record2State(record,chunks)
    expect(resultState).toEqual(state)
})