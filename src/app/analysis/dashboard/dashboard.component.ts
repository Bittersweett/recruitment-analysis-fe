import { Component, OnInit } from '@angular/core';
import { DataProviderService } from '../../service/data-provider.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

    constructor(
        private dataProvider: DataProviderService
    ) { }

    getCityDemand() {
        this.dataProvider.getData("http://localhost:8888/recru_analy/data", response => {
            console.log("response", response);
        });
    }

    ngOnInit() {
        this.getCityDemand();
    }

}
