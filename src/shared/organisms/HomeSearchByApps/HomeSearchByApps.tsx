
import React from 'react';
import { SubAppCardItem } from '../../molecules';
import './styles.less';

type Props = {}
type AppDetails = {
    key: React.Key;
    id: string;
    title: string;
    subtitle: string;
    tileColor: string;
    link: string;
    createLabel?: string;
}
const AppsList = new Map<string, AppDetails>([
    [
        'organisations', {
            id:  'applist/organisations',
            key: 'applist/organisations',
            title: 'Organizations',
            subtitle: 'Browse through different  group of datasets gather by those providing datas',
            tileColor: "linear-gradient(90deg, #F4CCA7 1.19%, #CA6666 100%)",
            link: '/orgs',
            createLabel: 'Create Organisation',
        }
    ], [
        'projects', {
            id: 'applist/projects',
            key: 'applist/projects',
            title: 'Projects',
            subtitle: "Browse through different  group of datasets gather by those providing datas",
            tileColor: "linear-gradient(90deg, #A7F4EB 1.19%, #66CABC 100%)",
            link: '/projects',
            createLabel: 'Create Project'
        }
    ], [
        'studios', {
            id: 'applist/studios',
            key: 'applist/studios',
            title: "Studios",
            subtitle: "Custom dashboards containing data grouped by thematic by scientist",
            tileColor: "linear-gradient(90deg, #C6A3F6 1.19%, #706CE8 100%)",
            link: '/studios',
            createLabel: 'Create Studio'
        }
    ]
]);


const HomeSearchByApps = (props: Props) => {
    const apps = [...AppsList.values()];
    return (
        <div className='home-searchby-appslist'>
            <h2 className='home-searchby-appslist-title'>Search by Lists</h2>
            <div className='home-searchby-appslist-container'>
                {apps.map(app => <SubAppCardItem {...app} to={app.link} />)}
            </div>
        </div>
    )
}


export default HomeSearchByApps;