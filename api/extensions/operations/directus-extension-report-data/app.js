import{defineOperationApp as e}from"@directus/extensions-sdk";var t=e({id:"report-data",name:"Report Data",icon:"box",description:"This is my custom operation!",overview:({type:e})=>[{label:"Type",text:e}],options:[{field:"type",name:"Type",type:"string",meta:{width:"half",interface:"select-dropdown",options:{choices:[{value:"pivot_table",text:"Pivot Table"},{value:"card_1",text:"Card 1"},{value:"card_2",text:"Card 2"},{value:"card_3",text:"Card 3"},{value:"card_4",text:"Card 4"},{value:"card_5",text:"Card 5"},{value:"card_6",text:"Card 6"},{value:"pie",text:"Pie"},{value:"progress_pie_1",text:"Progress Pie 1"},{value:"progress_pie_2",text:"Progress Pie 2"},{value:"vote_count",text:"Vote Count"}],allowOther:!1}}}]});export{t as default};
